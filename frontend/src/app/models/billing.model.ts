import { BillingPeriod } from './plan.model';

/** A Stripe subscription as mirrored by the API (GET /api/billing/subscriptions). */
export interface AdminSubscription {
  id: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  email: string;
  nom: string;
  site: string;
  slug: string;
  formule: string;
  periode: BillingPeriod;
  /** Recurring list price in euros, before any discount. */
  prix: number;
  promo: string | null;
  /** Stripe status: active, trialing, past_due, unpaid, canceled, incomplete… */
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  startedAt: string | null;
  source: 'site' | 'payment-link' | 'stripe';
  livemode: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Whether Stripe is wired on the API (GET /api/billing/status). */
export interface BillingStatus {
  checkout: boolean;
  webhook: boolean;
  livemode: boolean;
}

/** Human label + accent colour per Stripe status (palette of STATUS_META). */
export const SUBSCRIPTION_STATUS_META: Record<string, { label: string; color: string }> = {
  active: { label: 'Actif', color: '#7d9b6f' },
  trialing: { label: 'Essai', color: '#8aa0b0' },
  past_due: { label: 'Paiement en retard', color: '#c0a15e' },
  unpaid: { label: 'Impayé', color: '#a3737b' },
  canceled: { label: 'Résilié', color: '#6f6a63' },
  incomplete: { label: 'Paiement incomplet', color: '#c0a15e' },
  incomplete_expired: { label: 'Abandonné', color: '#6f6a63' },
  paused: { label: 'En pause', color: '#b9b5ad' },
};

export const SUBSCRIPTION_SOURCE_LABEL: Record<AdminSubscription['source'], string> = {
  site: 'Site',
  'payment-link': 'Lien de paiement',
  stripe: 'Stripe',
};

/** Statuses that bring money in — used for the recurring-revenue total. */
export const isBilling = (s: AdminSubscription): boolean =>
  s.status === 'active' || s.status === 'trialing' || s.status === 'past_due';

/** Monthly equivalent of the list price (annual ÷ 12). */
export const monthlyValue = (s: AdminSubscription): number =>
  s.periode === 'annuel' ? s.prix / 12 : s.prix;
