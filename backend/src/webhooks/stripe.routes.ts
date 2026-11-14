import { Router, raw } from 'express';
import Stripe from 'stripe';
import { config } from '../config';
import { Subscription } from '../models';
import { asyncHandler } from '../middleware/validate';
import { SubscriptionSource, SUBSCRIPTION_SOURCES } from '../billing/billing.schema';
import { billingEnabled, stripeClient } from '../billing/stripe';
import { sendSubscriptionNotification } from '../mail/subscription-mails';

export const stripeWebhookRouter = Router();

const toDate = (seconds: number | null | undefined): Date | null =>
  seconds ? new Date(seconds * 1000) : null;

/**
 * Rewrites our copy of a subscription from its live state in Stripe. Always
 * re-reading it (rather than trusting the event payload) makes the handler
 * indifferent to the order and repetition of events.
 */
async function syncSubscription(
  stripe: Stripe,
  subscriptionId: string,
  fromCheckout?: Stripe.Checkout.Session,
): Promise<void> {
  const sub = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['customer', 'items.data.price.product', 'discounts'],
  });

  const item = sub.items.data[0];
  const price = item?.price;
  const product = price && typeof price.product === 'object' ? price.product : null;
  const customer = typeof sub.customer === 'object' && !sub.customer.deleted ? sub.customer : null;
  const discount = sub.discounts?.find((d): d is Stripe.Discount => typeof d === 'object');
  const coupon = discount?.source?.coupon;

  const source = SUBSCRIPTION_SOURCES.includes(sub.metadata?.['source'] as SubscriptionSource)
    ? (sub.metadata['source'] as SubscriptionSource)
    : fromCheckout?.payment_link
      ? 'payment-link'
      : undefined;
  const site = fromCheckout?.custom_fields?.find((f) => f.key === 'site')?.text?.value;
  const details = fromCheckout?.customer_details;

  const set: Record<string, unknown> = {
    stripeCustomerId: typeof sub.customer === 'string' ? sub.customer : sub.customer.id,
    slug: sub.metadata?.['slug'] || price?.metadata?.['slug'] || (product && !product.deleted ? product.metadata?.['slug'] : '') || '',
    formule: product && !product.deleted ? product.name.replace(/^Abonnement\s+/i, '') : '',
    periode: price?.recurring?.interval === 'year' ? 'annuel' : 'mensuel',
    prix: (price?.unit_amount ?? 0) / 100,
    promo: coupon && typeof coupon === 'object' ? (coupon.name ?? coupon.id) : null,
    status: sub.status,
    cancelAtPeriodEnd: sub.cancel_at_period_end || !!sub.cancel_at,
    currentPeriodEnd: toDate(item?.current_period_end),
    canceledAt: toDate(sub.canceled_at),
    startedAt: toDate(sub.start_date),
    livemode: sub.livemode,
  };
  const email = details?.email ?? customer?.email;
  const nom = details?.name ?? customer?.name;
  if (email) set['email'] = email;
  if (nom) set['nom'] = nom;
  if (site) set['site'] = site;
  if (source) set['source'] = source;

  await Subscription.updateOne(
    { stripeSubscriptionId: sub.id },
    { $set: set },
    { upsert: true, setDefaultsOnInsert: true },
  );

  // Tell the team once per subscription, when the payment page completes.
  if (fromCheckout) {
    const first = await Subscription.findOneAndUpdate(
      { stripeSubscriptionId: sub.id, notifiedAt: null },
      { $set: { notifiedAt: new Date() } },
      { returnDocument: 'after' },
    );
    if (first) await sendSubscriptionNotification(first);
  }
}

/**
 * Stripe webhook. Mounted with a raw body parser (the signature covers the
 * exact bytes), so it must be registered before express.json(). A failure
 * answers 5xx on purpose: Stripe retries, and the sync is idempotent.
 */
stripeWebhookRouter.post(
  '/stripe',
  raw({ type: '*/*', limit: '1mb' }),
  asyncHandler(async (req, res) => {
    if (!billingEnabled() || !config.billing.stripeWebhookSecret) {
      res.status(503).json({ error: 'Webhook Stripe non configuré' });
      return;
    }
    const stripe = stripeClient();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body as Buffer,
        String(req.header('stripe-signature') ?? ''),
        config.billing.stripeWebhookSecret,
      );
    } catch {
      res.status(400).json({ error: 'Signature invalide' });
      return;
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode === 'subscription' && session.subscription) {
          const id = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
          await syncSubscription(stripe, id, session);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await syncSubscription(stripe, event.data.object.id);
        break;
      default:
        break;
    }

    res.status(200).json({ received: true });
  }),
);
