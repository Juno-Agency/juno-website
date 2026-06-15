import { Lead } from '@prisma/client';
import { Router } from 'express';
import { z } from '../openapi/zod';
import { prisma } from '../db';
import { registry } from '../openapi/registry';
import { asyncHandler, validateBody, validateQuery } from '../middleware/validate';
import { notFound } from '../middleware/http-error';
import { requireAuth } from '../auth/auth.middleware';
import {
  CreateLeadInput,
  CreateLeadSchema,
  CreatedLeadSchema,
  LEAD_STATUS,
  LeadSchema,
  ListLeadsQuerySchema,
  StatsSchema,
  UpdateLeadSchema,
} from './lead.schema';
import { buildStats } from './leads.stats';

export const leadsRouter = Router();

type ListQuery = z.infer<typeof ListLeadsQuerySchema>;
type UpdateLead = z.infer<typeof UpdateLeadSchema>;

/** Serialize a Prisma Lead into the API shape (dates → ISO strings). */
function toDto(lead: Lead) {
  return {
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString(),
  };
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
  request: { params: z.object({ id: z.string().uuid() }) },
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
    params: z.object({ id: z.string().uuid() }),
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
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    204: { description: 'Supprimée' },
    404: { description: 'Introuvable' },
  },
});

/* ---------------- Handlers ---------------- */

// Public: the intake form posts here.
leadsRouter.post(
  '/',
  validateBody(CreateLeadSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as CreateLeadInput;
    const lead = await prisma.lead.create({ data });
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
    const leads = await prisma.lead.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
    res.json(leads.map(toDto));
  }),
);

// Stats — must be declared before '/:id' so it isn't captured as an id.
leadsRouter.get(
  '/stats',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const leads = await prisma.lead.findMany({
      select: {
        status: true,
        type: true,
        secteur: true,
        budget: true,
        createdAt: true,
      },
    });
    res.json(buildStats(leads));
  }),
);

leadsRouter.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const lead = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!lead) throw notFound('Demande introuvable');
    res.json(toDto(lead));
  }),
);

leadsRouter.patch(
  '/:id',
  requireAuth,
  validateBody(UpdateLeadSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as UpdateLead;
    const exists = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!exists) throw notFound('Demande introuvable');
    const lead = await prisma.lead.update({ where: { id: req.params.id }, data });
    res.json(toDto(lead));
  }),
);

leadsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const exists = await prisma.lead.findUnique({ where: { id: req.params.id } });
    if (!exists) throw notFound('Demande introuvable');
    await prisma.lead.delete({ where: { id: req.params.id } });
    res.status(204).end();
  }),
);
