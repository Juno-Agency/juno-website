import { z } from '../openapi/zod';

/** Colonnes du backlog. */
export const TICKET_STATUS = ['TODO', 'DOING', 'DONE'] as const;
export const TICKET_PRIORITY = ['LOW', 'MEDIUM', 'HIGH'] as const;
/**
 * Qui prend le ticket. Une liste fermée plutôt qu'un texte libre : à deux, une
 * faute de frappe qui crée un troisième assigné coûte plus cher que la
 * souplesse ne rapporte. `null` = personne, le ticket est au backlog commun.
 */
export const TICKET_ASSIGNEE = ['NOAH', 'JULIEN'] as const;

export type TicketStatus = (typeof TICKET_STATUS)[number];
export type TicketPriority = (typeof TICKET_PRIORITY)[number];
export type TicketAssignee = (typeof TICKET_ASSIGNEE)[number];

/** Body accepté par POST /api/tickets. La clé n'est jamais fournie par le client. */
export const CreateTicketSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().max(4000).default(''),
  status: z.enum(TICKET_STATUS).default('TODO'),
  priority: z.enum(TICKET_PRIORITY).default('MEDIUM'),
  assignee: z.enum(TICKET_ASSIGNEE).nullable().default(null),
});

export type CreateTicketInput = z.infer<typeof CreateTicketSchema>;

/** Body pour PATCH /api/tickets/:id — chaque champ facultatif. */
export const UpdateTicketSchema = CreateTicketSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: 'Au moins un champ doit être fourni' },
);

export type UpdateTicketInput = z.infer<typeof UpdateTicketSchema>;

export const ListTicketsQuerySchema = z.object({
  status: z.enum(TICKET_STATUS).optional(),
  assignee: z.enum(TICKET_ASSIGNEE).optional(),
  take: z.coerce.number().int().min(1).max(200).default(100),
  skip: z.coerce.number().int().min(0).default(0),
});

export const TicketSchema = z.object({
  id: z.string(),
  key: z.string(),
  seq: z.number().int(),
  title: z.string(),
  description: z.string(),
  status: z.enum(TICKET_STATUS),
  priority: z.enum(TICKET_PRIORITY),
  assignee: z.enum(TICKET_ASSIGNEE).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
