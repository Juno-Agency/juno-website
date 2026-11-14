import { z } from '../openapi/zod';
import { BILLING_PERIODS } from '../plans/plan.schema';

/** Where a subscription was started. */
export const SUBSCRIPTION_SOURCES = ['site', 'payment-link', 'stripe'] as const;
export type SubscriptionSource = (typeof SUBSCRIPTION_SOURCES)[number];

/** Languages of the site, passed on to the Stripe payment page. */
export const CHECKOUT_LANGS = ['fr', 'en', 'de'] as const;

/** Body accepted by POST /api/billing/checkout (public). */
export const CheckoutSchema = z.object({
  slug: z.string().trim().toLowerCase().min(1).max(40),
  periode: z.enum(BILLING_PERIODS),
  lang: z.enum(CHECKOUT_LANGS).default('fr'),
});

export type CheckoutInput = z.infer<typeof CheckoutSchema>;
