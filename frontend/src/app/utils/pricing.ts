import { BillingPeriod, Plan } from '../models/plan.model';

/** What a plan costs for a billing period, once a running promo is applied. */
export interface PlanPrice {
  /** List price for the period (per month, or per full year). */
  base: number;
  /** Price after the promo — equals `base` when none is running. */
  price: number;
  /** Monthly equivalent of `price` (annual ÷ 12), for the "soit … /mois" line. */
  perMonth: number;
  promo: { percent: number; label: string; months: number | null; endsAt: string | null } | null;
}

/** Is the plan's promo live for this period today? */
export function promoRuns(plan: Plan, period: BillingPeriod, now = new Date()): boolean {
  const p = plan.promo;
  if (!p?.active || !p.percent) return false;
  if (p.appliesTo !== 'both' && p.appliesTo !== period) return false;
  // "The first N months" only means something on a monthly bill.
  if (period === 'annuel' && p.months) return false;
  return !p.endsAt || new Date(p.endsAt).getTime() >= now.getTime();
}

/**
 * Mirrors `effectivePrice` in `backend/src/plans/plan.schema.ts` — the price a
 * lead is snapshotted with must be the one the visitor saw. Keep both in step.
 */
export function planPrice(plan: Plan, period: BillingPeriod, now = new Date()): PlanPrice {
  const base = period === 'annuel' ? plan.annualPrice : plan.monthlyPrice;
  const running = promoRuns(plan, period, now);
  const price = running ? Math.round(base * (100 - plan.promo.percent)) / 100 : base;
  return {
    base,
    price,
    perMonth: period === 'annuel' ? Math.round((price / 12) * 100) / 100 : price,
    promo: running
      ? {
          percent: plan.promo.percent,
          label: plan.promo.label,
          months: plan.promo.months,
          endsAt: plan.promo.endsAt,
        }
      : null,
  };
}

/** Saving of the annual price over twelve monthly payments, in % (0 if none). */
export function annualSaving(plan: Plan): number {
  const full = plan.monthlyPrice * 12;
  if (full <= 0 || plan.annualPrice >= full) return 0;
  return Math.round(((full - plan.annualPrice) / full) * 100);
}

const EUR = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** 69 → "69 €", 57.5 → "57,50 €". */
export function formatEuros(value: number): string {
  const v = Number.isInteger(value) ? value : Math.round(value * 100) / 100;
  return Number.isInteger(v)
    ? EUR.format(v)
    : new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(v);
}
