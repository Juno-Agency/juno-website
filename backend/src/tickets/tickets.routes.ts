import { Router } from 'express';
import { isValidObjectId } from 'mongoose';

import { z } from '../openapi/zod';
import { Counter, Ticket } from '../models';
import { registry } from '../openapi/registry';
import { asyncHandler, validateBody, validateQuery } from '../middleware/validate';
import { notFound } from '../middleware/http-error';
import { requireAuth } from '../auth/auth.middleware';
import { formatTicketKey, nextTicketSeq } from './ticket-key';
import {
  CreateTicketInput,
  CreateTicketSchema,
  ListTicketsQuerySchema,
  TicketSchema,
  UpdateTicketInput,
  UpdateTicketSchema,
} from './ticket.schema';

export const ticketsRouter = Router();

type ListQuery = z.infer<typeof ListTicketsQuerySchema>;

/** 404 pour les ids qui ne sont pas des ObjectId (évite une erreur de cast). */
function requireObjectId(id: string): void {
  if (!isValidObjectId(id)) throw notFound('Ticket introuvable');
}

/* ---------------- OpenAPI ---------------- */
registry.registerPath({
  method: 'post',
  path: '/api/tickets',
  tags: ['Tickets'],
  summary: 'Crée un ticket du backlog interne',
  security: [{ bearerAuth: [] }],
  request: { body: { content: { 'application/json': { schema: CreateTicketSchema } } } },
  responses: {
    201: { description: 'Ticket créé', content: { 'application/json': { schema: TicketSchema } } },
    401: { description: 'Non autorisé' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/tickets',
  tags: ['Tickets'],
  summary: 'Liste les tickets, du plus récent au plus ancien',
  security: [{ bearerAuth: [] }],
  request: { query: ListTicketsQuerySchema },
  responses: {
    200: {
      description: 'Liste des tickets',
      content: { 'application/json': { schema: z.array(TicketSchema) } },
    },
    401: { description: 'Non autorisé' },
  },
});

registry.registerPath({
  method: 'patch',
  path: '/api/tickets/{id}',
  tags: ['Tickets'],
  summary: 'Met à jour un ticket',
  security: [{ bearerAuth: [] }],
  request: {
    params: z.object({ id: z.string() }),
    body: { content: { 'application/json': { schema: UpdateTicketSchema } } },
  },
  responses: {
    200: { description: 'Ticket mis à jour', content: { 'application/json': { schema: TicketSchema } } },
    404: { description: 'Introuvable' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/tickets/{id}',
  tags: ['Tickets'],
  summary: 'Supprime un ticket',
  security: [{ bearerAuth: [] }],
  request: { params: z.object({ id: z.string() }) },
  responses: {
    204: { description: 'Supprimé' },
    404: { description: 'Introuvable' },
  },
});

/* ---------------- Handlers ---------------- */
// Backlog interne : tout est derrière l'authentification du back-office.

ticketsRouter.post(
  '/',
  requireAuth,
  validateBody(CreateTicketSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as CreateTicketInput;
    const seq = await nextTicketSeq(Counter);
    const ticket = await Ticket.create({ ...data, seq, key: formatTicketKey(seq) });
    res.status(201).json(ticket);
  }),
);

ticketsRouter.get(
  '/',
  requireAuth,
  validateQuery(ListTicketsQuerySchema),
  asyncHandler(async (_req, res) => {
    const { status, assignee, take, skip } = res.locals['query'] as ListQuery;
    const filter: Record<string, unknown> = {};
    if (status) filter['status'] = status;
    if (assignee) filter['assignee'] = assignee;
    const tickets = await Ticket.find(filter)
      .sort({ seq: -1 })
      .skip(skip)
      .limit(take);
    res.json(tickets);
  }),
);

ticketsRouter.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    requireObjectId(req.params.id);
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) throw notFound('Ticket introuvable');
    res.json(ticket);
  }),
);

ticketsRouter.patch(
  '/:id',
  requireAuth,
  validateBody(UpdateTicketSchema),
  asyncHandler(async (req, res) => {
    requireObjectId(req.params.id);
    const data = req.body as UpdateTicketInput;
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!ticket) throw notFound('Ticket introuvable');
    res.json(ticket);
  }),
);

ticketsRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    requireObjectId(req.params.id);
    // Le compteur n'est pas décrémenté : le numéro reste retiré de la circulation.
    const deleted = await Ticket.findByIdAndDelete(req.params.id);
    if (!deleted) throw notFound('Ticket introuvable');
    res.status(204).end();
  }),
);
