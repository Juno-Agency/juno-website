import { z } from '../openapi/zod';

/** Optional URL that also accepts an empty string (cleared field). */
const optionalUrl = z.union([z.string().url().max(600), z.literal('')]).optional();

/** Body accepted by POST /api/portfolio (back-office). */
export const CreatePortfolioSchema = z.object({
  title: z.string().trim().min(1).max(160),
  client: z.string().trim().max(120).default(''),
  category: z.string().trim().max(80).default(''),
  tags: z.array(z.string().trim().max(40)).max(20).default([]),
  description: z.string().max(2000).default(''),
  imageUrl: optionalUrl,
  imageKey: z.string().max(300).default(''),
  url: optionalUrl,
  year: z.string().trim().max(10).default(''),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
});

export type CreatePortfolioInput = z.infer<typeof CreatePortfolioSchema>;

/** Body for PATCH /api/portfolio/:id — every field optional. */
export const UpdatePortfolioSchema = CreatePortfolioSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: 'Au moins un champ doit être fourni' },
);

export type UpdatePortfolioInput = z.infer<typeof UpdatePortfolioSchema>;
