import Stripe from 'stripe';
import { config } from '../config';
import { HttpError } from '../middleware/http-error';
import { BillingPeriod, PlanPricing, promoRuns } from '../plans/plan.schema';

/** What the catalogue sync needs to know about a plan. */
export interface BillablePlan extends PlanPricing {
  name: string;
  slug: string;
  tagline?: string | null;
}

let client: Stripe | null = null;

export const billingEnabled = (): boolean => !!config.billing.stripeSecretKey;

/** The Stripe client, or a 503 while no secret key is configured. */
export function stripeClient(): Stripe {
  if (!billingEnabled()) {
    throw new HttpError(503, 'Le paiement en ligne n’est pas encore disponible');
  }
  return (client ??= new Stripe(config.billing.stripeSecretKey));
}

/** Stable handle of a plan's price in Stripe, e.g. `croissance_annuel`. */
export const lookupKey = (slug: string, period: BillingPeriod): string => `${slug}_${period}`;

const intervalOf = (period: BillingPeriod): 'month' | 'year' =>
  period === 'annuel' ? 'year' : 'month';

async function findOrCreateProduct(stripe: Stripe, plan: BillablePlan): Promise<string> {
  for await (const product of stripe.products.list({ active: true, limit: 100 })) {
    if (product.metadata?.['slug'] === plan.slug) return product.id;
  }
  const created = await stripe.products.create({
    name: `Abonnement ${plan.name}`,
    ...(plan.tagline ? { description: plan.tagline } : {}),
    metadata: { slug: plan.slug, source: 'juno-website' },
  });
  return created.id;
}

/**
 * The Stripe price to charge for a plan and period. The back-office is the
 * source of truth for amounts: when the price behind the lookup key is missing
 * or no longer matches the plan, a new one is created and takes the key over.
 * The previous price is left active on purpose — existing subscribers and
 * payment links keep using it.
 */
export async function ensurePrice(
  stripe: Stripe,
  plan: BillablePlan,
  period: BillingPeriod,
): Promise<Stripe.Price> {
  const key = lookupKey(plan.slug, period);
  const amount = Math.round((period === 'annuel' ? plan.annualPrice : plan.monthlyPrice) * 100);
  const interval = intervalOf(period);

  const found = await stripe.prices.list({ lookup_keys: [key], active: true, limit: 1 });
  const current = found.data[0];
  if (
    current &&
    current.unit_amount === amount &&
    current.currency === 'eur' &&
    current.recurring?.interval === interval
  ) {
    return current;
  }

  const product = current
    ? typeof current.product === 'string'
      ? current.product
      : current.product.id
    : await findOrCreateProduct(stripe, plan);

  return stripe.prices.create({
    product,
    currency: 'eur',
    unit_amount: amount,
    recurring: { interval },
    nickname: `${plan.name} ${period}`,
    lookup_key: key,
    transfer_lookup_key: true,
    metadata: { slug: plan.slug, periode: period },
  });
}

/**
 * The coupon matching the plan's promo, when it is running for this period —
 * null otherwise. "The first N months" becomes a repeating coupon; a promo
 * without a month count discounts the subscription for as long as it lives,
 * which is what the pricing page shows. Coupons are created on demand and
 * reused: their id encodes the terms.
 */
export async function ensureCoupon(
  stripe: Stripe,
  plan: BillablePlan,
  period: BillingPeriod,
): Promise<string | null> {
  const promo = plan.promo;
  if (!promo || !promoRuns(plan, period)) return null;
  const percent = promo.percent!;
  const months = promo.months ?? null;
  const id = `juno-${plan.slug}-${percent}pc-${months ? `${months}m` : 'forever'}`;

  try {
    await stripe.coupons.retrieve(id);
    return id;
  } catch (err) {
    if ((err as { code?: string }).code !== 'resource_missing') throw err;
  }
  await stripe.coupons.create({
    id,
    name: (promo.label || 'Remise').slice(0, 40),
    percent_off: percent,
    ...(months
      ? { duration: 'repeating' as const, duration_in_months: months }
      : { duration: 'forever' as const }),
    metadata: { slug: plan.slug, source: 'juno-website' },
  });
  return id;
}
