import { z } from '../openapi/zod';

export const BILLING_PERIODS = ['mensuel', 'annuel'] as const;
export type BillingPeriod = (typeof BILLING_PERIODS)[number];

/** Which billing period a promotion discounts. */
export const PROMO_SCOPES = ['both', 'mensuel', 'annuel'] as const;

/** Prices are in euros, up to two decimals (TVA non applicable). */
const price = z.number().min(0).max(100_000);

const PromoSchema = z.object({
  active: z.boolean().default(false),
  percent: z.number().int().min(1).max(100).default(10),
  // Public wording, e.g. "Offre de lancement".
  label: z.string().trim().max(60).default(''),
  // Discount only the first N months (null = for as long as the promo runs).
  months: z.number().int().min(1).max(36).nullable().default(null),
  // Last day the promo is shown (ISO date), null = no end date.
  endsAt: z.string().datetime().nullable().default(null),
  appliesTo: z.enum(PROMO_SCOPES).default('both'),
});

/** Body accepted by POST /api/plans (back-office). */
export const CreatePlanSchema = z.object({
  name: z.string().trim().min(1).max(60),
  // Stable identifier used in links (/projet?formule=…) and on leads. Left
  // empty, it is derived from the name.
  slug: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lettres minuscules, chiffres et tirets uniquement')
      .max(40)
      .optional(),
  ),
  tagline: z.string().trim().max(200).default(''),
  monthlyPrice: price,
  annualPrice: price,
  features: z.array(z.string().trim().min(1).max(140)).max(20).default([]),
  badge: z.string().trim().max(40).default(''),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  order: z.number().int().default(0),
  promo: PromoSchema.default({}),
});

export type CreatePlanInput = z.infer<typeof CreatePlanSchema>;

/** Body for PATCH /api/plans/:id — every field optional. */
export const UpdatePlanSchema = CreatePlanSchema.partial().refine(
  (v) => Object.keys(v).length > 0,
  { message: 'Au moins un champ doit être fourni' },
);

export type UpdatePlanInput = z.infer<typeof UpdatePlanSchema>;

/**
 * Body for PUT /api/plans/comparison — the whole comparison table, in display
 * order. `values` maps a plan id to its cell: "✓", a short text, or "" (—).
 */
export const ComparisonTableSchema = z
  .array(
    z.object({
      group: z.string().trim().max(60).default(''),
      label: z.string().trim().min(1).max(120),
      values: z.record(z.string(), z.string().trim().max(60)).default({}),
    }),
  )
  .max(60);

export type ComparisonTableInput = z.infer<typeof ComparisonTableSchema>;

/** "Croissance Pro" → "croissance-pro". */
export function slugify(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

export interface PlanPricing {
  monthlyPrice: number;
  annualPrice: number;
  promo?: {
    active?: boolean;
    percent?: number;
    label?: string;
    months?: number | null;
    endsAt?: Date | string | null;
    appliesTo?: string;
  } | null;
}

/**
 * Price shown for a period, after the promo when it is running. Mirrors
 * `frontend/src/app/utils/pricing.ts` — keep both in step.
 */
export function effectivePrice(
  plan: PlanPricing,
  period: BillingPeriod,
  now = new Date(),
): { price: number; promoLabel: string | null } {
  const base = period === 'annuel' ? plan.annualPrice : plan.monthlyPrice;
  const p = plan.promo;
  const running =
    !!p?.active &&
    !!p.percent &&
    (p.appliesTo === 'both' || p.appliesTo === period || !p.appliesTo) &&
    // "The first N months" only means something on a monthly bill.
    !(period === 'annuel' && p.months) &&
    (!p.endsAt || new Date(p.endsAt).getTime() >= now.getTime());
  if (!running) return { price: base, promoLabel: null };
  const price = Math.round(base * (100 - p.percent!)) / 100;
  return { price, promoLabel: `${p.label || 'Remise'} −${p.percent} %` };
}
