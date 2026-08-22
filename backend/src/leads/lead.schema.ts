import { z } from '../openapi/zod';
import { registry } from '../openapi/registry';

export const LEAD_STATUS = ['NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST'] as const;
export const EXISTING = ['refaire', 'aucun'] as const;
export const SITE_TYPES = [
  'Site vitrine',
  'Boutique en ligne',
  'Application web',
] as const;

/** Body accepted by POST /api/leads — mirrors the front-end intake payload. */
export const CreateLeadSchema = registry.register(
  'CreateLead',
  z
    .object({
      nom: z.string().trim().min(1).max(120).openapi({ example: 'Camille Dubois' }),
      email: z.string().trim().email().max(180).openapi({ example: 'camille@exemple.fr' }),
      tel: z.string().trim().max(40).optional().openapi({ example: '06 12 34 56 78' }),
      secteur: z.string().trim().min(1).max(80).openapi({ example: 'Restauration' }),
      existant: z.enum(EXISTING).openapi({ example: 'aucun' }),
      type: z.enum(SITE_TYPES).openapi({ example: 'Site vitrine' }),
      pages: z.array(z.string().max(60)).max(40).default([]).openapi({ example: ['Accueil', 'Contact'] }),
      styles: z.array(z.string().max(60)).max(40).default([]).openapi({ example: ['Épuré', 'Moderne'] }),
      refs: z.string().max(4000).default('').openapi({ example: "J'aime bien le site de…" }),
      colors: z.array(z.string().max(20)).max(20).default([]).openapi({ example: ['#8cc63f'] }),
      budget: z.string().trim().max(80).optional().openapi({ example: '1 000 – 3 000 €' }),
      echeance: z.string().trim().max(80).optional().openapi({ example: 'Sous 1 mois' }),
      message: z.string().max(4000).optional().openapi({ example: 'On veut lancer notre site avant l’été.' }),
      // Anti-spam (not persisted): `website` is a honeypot that must stay empty;
      // `startedAt` is the client ms timestamp of when the form was opened.
      website: z.string().max(200).optional().openapi({ example: '' }),
      startedAt: z.number().int().optional().openapi({ example: 1_699_999_999_000 }),
      // When the client confirmed this is a returning project: link the new lead
      // to their existing one(s) with the same email.
      combineWithExisting: z.boolean().optional().openapi({ example: false }),
    })
    .openapi('CreateLead'),
);

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>;

/** Full lead as stored / returned to the back office. */
export const LeadSchema = registry.register(
  'Lead',
  z
    .object({
      id: z.string().uuid(),
      nom: z.string(),
      email: z.string(),
      tel: z.string().nullable(),
      secteur: z.string(),
      existant: z.string(),
      type: z.string(),
      pages: z.array(z.string()),
      styles: z.array(z.string()),
      refs: z.string(),
      colors: z.array(z.string()),
      budget: z.string().nullable(),
      echeance: z.string().nullable(),
      message: z.string().nullable(),
      status: z.enum(LEAD_STATUS),
      relatedLeadIds: z.array(z.string()).default([]),
      createdAt: z.string().datetime(),
      updatedAt: z.string().datetime(),
    })
    .openapi('Lead'),
);

/** Query for GET /api/leads/exists — public duplicate pre-check. */
export const ExistsQuerySchema = z.object({
  email: z.string().trim().email().max(180),
});

/** Body for PATCH /api/leads/:id — every field optional (back office edit). */
export const UpdateLeadSchema = registry.register(
  'UpdateLead',
  z
    .object({
      nom: z.string().trim().min(1).max(120),
      email: z.string().trim().email().max(180),
      tel: z.string().trim().max(40).nullable(),
      secteur: z.string().trim().min(1).max(80),
      existant: z.enum(EXISTING),
      type: z.enum(SITE_TYPES),
      pages: z.array(z.string().max(60)).max(40),
      styles: z.array(z.string().max(60)).max(40),
      refs: z.string().max(4000),
      colors: z.array(z.string().max(20)).max(20),
      budget: z.string().trim().max(80).nullable(),
      echeance: z.string().trim().max(80).nullable(),
      message: z.string().max(4000).nullable(),
      status: z.enum(LEAD_STATUS),
    })
    .partial()
    .refine((v) => Object.keys(v).length > 0, {
      message: 'Au moins un champ doit être fourni',
    })
    .openapi('UpdateLead'),
);

/** Query params for GET /api/leads. */
export const ListLeadsQuerySchema = z.object({
  status: z.enum(LEAD_STATUS).optional(),
  take: z.coerce.number().int().min(1).max(200).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

export const CreatedLeadSchema = registry.register(
  'CreatedLead',
  z.object({ id: z.string().uuid() }).openapi('CreatedLead'),
);

const CountPair = z.object({ label: z.string(), count: z.number() });

/** Aggregated metrics for the back-office statistics view. */
export const StatsSchema = registry.register(
  'LeadStats',
  z
    .object({
      total: z.number(),
      last30Days: z.number(),
      byStatus: z.record(z.string(), z.number()),
      byType: z.array(CountPair),
      bySecteur: z.array(CountPair),
      byBudget: z.array(CountPair),
      sentQuotes: z.number(),
      signedQuotes: z.number(),
      lostQuotes: z.number(),
      conversionRate: z.number(),
      signatureRate: z.number(),
      timeline: z.array(z.object({ period: z.string(), count: z.number() })),
    })
    .openapi('LeadStats'),
);
