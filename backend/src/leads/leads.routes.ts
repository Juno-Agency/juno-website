import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from '../openapi/zod';
import { Lead } from '../models';
import { registry } from '../openapi/registry';
import { asyncHandler, validateBody, validateQuery } from '../middleware/validate';
import { notFound } from '../middleware/http-error';
import { requireAuth } from '../auth/auth.middleware';
import { createLeadLimiter, checkLeadLimiter } from '../middleware/rate-limit';
import {
  CreateLeadInput,
  CreateLeadSchema,
  CreatedLeadSchema,
  ExistsQuerySchema,
  LeadSchema,
  ListLeadsQuerySchema,
  StatsSchema,
  UpdateLeadSchema,
} from './lead.schema';
import { buildStats, StatsInput } from './leads.stats';
import { sendLeadEmails, resendLeadEmails, LeadForMail } from '../mail/lead-mails';
import { config } from '../config';
import { isBotSubmission } from './antispam';

export const leadsRouter = Router();

type ListQuery = z.infer<typeof ListLeadsQuerySchema>;
type UpdateLead = z.infer<typeof UpdateLeadSchema>;

/** 404 for ids that aren't valid Mongo ObjectIds (avoids a cast error). */
function requireObjectId(id: string): void {
  if (!isValidObjectId(id)) throw notFound('Demande introuvable');
}

/** Bidirectionally link a lead to every other lead sharing its email (case-insensitive). */
async function linkLeadsByEmail(newId: unknown, email: string): Promise<void> {
  const others = await Lead.find({ email, _id: { $ne: newId } })
    .collation({ locale: 'en', strength: 2 })
    .select('_id');
  if (others.length === 0) return;
  const otherIds = others.map((o) => String(o._id));
  await Lead.updateOne({ _id: newId }, { $addToSet: { relatedLeadIds: { $each: otherIds } } });
  await Lead.updateMany(
    { _id: { $in: others.map((o) => o._id) } },
    { $addToSet: { relatedLeadIds: String(newId) } },
  );
}

/* ---------------- OpenAPI paths ---------------- */
registry.registerPath({
  method: 'post',
  path: '/api/leads',
  tags: ['Leads'],
  summary: 'Enregistre une demande issue du formulaire d’intake',
  request: {
    body: { content: { 'application/json': { schema: CreateLeadSchema } } },
  },
  responses: {
    201: {
      description: 'Demande créée',
      content: { 'application/json': { schema: CreatedLeadSchema } },
    },
    400: { description: 'Données invalides' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/leads',
  tags: ['Leads'],
  summary: 'Liste les demandes (back-office)',
  security: [{ bearerAuth: [] }],
  request: { query: ListLeadsQuerySchema },
  responses: {
    200: {
      description: 'Liste des demandes',
      content: { 'application/json': { schema: z.array(LeadSchema) } },
    },
    401: { description: 'Non autorisé' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/leads/stats',
  tags: ['Leads'],
  summary: 'Statistiques agrégées des demandes (back-office)',
  security: [{ bearerAuth: [] }],
  responses: {
    200: {
      description: 'Métriques',
      content: { 'application/json': { schema: StatsSchema } },
    },
    401: { description: 'Non autorisé' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/leads/{id}',
  tags: ['Leads'],
  summary: 'Détaille une demande (back-office)',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: { description: 'Demande', content: { 'application/json': { schema: LeadSchema } } },
    404: { description: 'Introuvable' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/leads/{id}',
  tags: ['Leads'],
  summary: 'Met à jour une demande — statut et/ou n’importe quel champ (back-office)',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { 'application/json': { schema: UpdateLeadSchema } } },
  },
  responses: {
    200: { description: 'Demande mise à jour', content: { 'application/json': { schema: LeadSchema } } },
    404: { description: 'Introuvable' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/leads/{id}',
  tags: ['Leads'],
  summary: 'Supprime une demande (back-office)',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Supprimée' },
    404: { description: 'Introuvable' },
  },
});

/* ---------------- Handlers ---------------- */

// Public: the intake form posts here.
leadsRouter.post(
  '/',
  createLeadLimiter,
  validateBody(CreateLeadSchema),
  asyncHandler(async (req, res) => {
    const { website, startedAt, combineWithExisting, ...data } = req.body as CreateLeadInput;

    // Anti-spam (fail-safe): drop bots but answer 201 anyway so they can't tell,
    // and never block a real user (see isBotSubmission).
    if (isBotSubmission({ website, startedAt, now: Date.now(), minFillMs: config.antispamMinFillMs })) {
      console.warn('[JUNO] lead dropped as spam', { honeypot: Boolean(website) });
      res.status(201).json({ id: 'ok' });
      return;
    }

    const lead = await Lead.create(data);

    // Returning client chose "combine": bidirectionally link this lead to their
    // existing ones (same email, case-insensitive).
    if (combineWithExisting) {
      try {
        await linkLeadsByEmail(lead._id, lead.email);
      } catch (err) {
        console.error('[JUNO] failed to link related leads', err);
      }
    }

    res.status(201).json({ id: lead.id });

    // Fire notification + client recap without blocking the response. Errors are
    // swallowed inside sendLeadEmails so a mail issue never fails the submission.
    void sendLeadEmails(lead.toJSON() as unknown as LeadForMail);
  }),
);

// Public duplicate pre-check: does a lead already exist for this email? Returns
// only a boolean (no lead details) to avoid leaking who is a client.
leadsRouter.get(
  '/exists',
  checkLeadLimiter,
  validateQuery(ExistsQuerySchema),
  asyncHandler(async (_req, res) => {
    const { email } = res.locals['query'] as { email: string };
    const found = await Lead.exists({ email }).collation({ locale: 'en', strength: 2 });
    res.json({ exists: Boolean(found) });
  }),
);

// Back-office endpoints (JWT-protected).
leadsRouter.get(
  '/',
  requireAuth,
  validateQuery(ListLeadsQuerySchema),
  asyncHandler(async (_req, res) => {
    const { status, take, skip } = res.locals['query'] as ListQuery;
    const leads = await Lead.find(status ? { status } : {})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(take);
    res.json(leads);
  }),
);

// Stats — must be declared before '/:id' so it isn't captured as an id.
leadsRouter.get(
  '/stats',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const leads = await Lead.find(
      {},
      'status type secteur budget createdAt',
    ).lean();
    res.json(buildStats(leads as unknown as StatsInput[]));
  }),
);

leadsRouter.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    requireObjectId(req.params.id);
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw notFound('Demande introuvable');
    res.json(lead);
  }),
);

leadsRouter.patch(
  '/:id',
  requireAuth,
  validateBody(UpdateLeadSchema),
  asyncHandler(async (req, res) => {
    requireObjectId(req.params.id);
    const data = req.body as UpdateLead;
    const lead = await Lead.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!lead) throw notFound('Demande introuvable');
    res.json(lead);
  }),
);

// Re-send the lead emails from the back office (client recap by default).
leadsRouter.post(
  '/:id/resend',
  requireAuth,
  asyncHandler(async (req, res) => {
    requireObjectId(req.params.id);
    const kindRaw = String(req.query['kind'] ?? 'client');
    const which = (['internal', 'client', 'both'] as const).includes(kindRaw as never)
      ? (kindRaw as 'internal' | 'client' | 'both')
      : 'client';
    const lead = await Lead.findById(req.params.id);
    if (!lead) throw notFound('Demande introuvable');
    const result = await resendLeadEmails(lead.toJSON() as unknown as LeadForMail, which);
    // Return the fresh lead (with the new email record) so the UI can refresh.
    const updated = await Lead.findById(req.params.id);
    res.json({ result, lead: updated });
  }),
);

leadsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    requireObjectId(req.params.id);
    const deleted = await Lead.findByIdAndDelete(req.params.id);
    if (!deleted) throw notFound('Demande introuvable');
    res.status(204).end();
  }),
);
