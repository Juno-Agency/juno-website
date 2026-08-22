import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { z } from '../openapi/zod';
import { Lead } from '../models';
import { registry } from '../openapi/registry';
import { asyncHandler, validateBody, validateQuery } from '../middleware/validate';
import { notFound } from '../middleware/http-error';
import { requireAuth } from '../auth/auth.middleware';
import { createLeadLimiter } from '../middleware/rate-limit';
import {
  CreateLeadInput,
  CreateLeadSchema,
  CreatedLeadSchema,
  LeadSchema,
  ListLeadsQuerySchema,
  StatsSchema,
  UpdateLeadSchema,
} from './lead.schema';
import { buildStats, StatsInput } from './leads.stats';

export const leadsRouter = Router();

type ListQuery = z.infer<typeof ListLeadsQuerySchema>;
type UpdateLead = z.infer<typeof UpdateLeadSchema>;

/** 404 for ids that aren't valid Mongo ObjectIds (avoids a cast error). */
function requireObjectId(id: string): void {
  if (!isValidObjectId(id)) throw notFound('Demande introuvable');
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
    const data = req.body as CreateLeadInput;
    const lead = await Lead.create(data);
    res.status(201).json({ id: lead.id });
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
