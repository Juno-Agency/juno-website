import { Router } from 'express';
import { config } from '../config';
import { Plan, Subscription } from '../models';
import { asyncHandler, validateBody } from '../middleware/validate';
import { HttpError, notFound } from '../middleware/http-error';
import { requireAuth } from '../auth/auth.middleware';
import { checkoutLimiter } from '../middleware/rate-limit';
import { CheckoutInput, CheckoutSchema } from './billing.schema';
import { billingEnabled, ensureCoupon, ensurePrice, stripeClient } from './stripe';

export const billingRouter = Router();

/* ---------------- Public ---------------- */

// Starts a subscription: returns the URL of a Stripe Checkout page for a
// published plan. The amount comes from the plan, never from the request.
billingRouter.post(
  '/checkout',
  checkoutLimiter,
  validateBody(CheckoutSchema),
  asyncHandler(async (req, res) => {
    const { slug, periode, lang } = req.body as CheckoutInput;
    const stripe = stripeClient();

    const plan = await Plan.findOne({ slug, published: true });
    if (!plan) throw notFound('Formule introuvable');

    let url: string | null;
    try {
      const price = await ensurePrice(stripe, plan, periode);
      const coupon = await ensureCoupon(stripe, plan, periode);
      const metadata = { slug: plan.slug, periode, source: 'site' };
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [{ price: price.id, quantity: 1 }],
        ...(coupon ? { discounts: [{ coupon }] } : {}),
        locale: lang,
        billing_address_collection: 'required',
        custom_fields: [
          {
            key: 'site',
            type: 'text',
            optional: true,
            label: { type: 'custom', custom: 'Adresse de votre site' },
          },
        ],
        metadata,
        subscription_data: { metadata },
        success_url: `${config.siteUrl}/tarifs?abonnement=ok`,
        cancel_url: `${config.siteUrl}/tarifs`,
      });
      url = session.url;
    } catch (err) {
      console.error('[JUNO][billing] checkout failed:', err);
      throw new HttpError(502, 'Le paiement en ligne est momentanément indisponible');
    }
    if (!url) throw new HttpError(502, 'Le paiement en ligne est momentanément indisponible');

    res.json({ url });
  }),
);

/* ---------------- Back-office (JWT) ---------------- */

// Whether Stripe is wired, so the back-office can say why the list is empty.
billingRouter.get(
  '/status',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const key = config.billing.stripeSecretKey;
    res.json({
      checkout: billingEnabled(),
      webhook: !!config.billing.stripeWebhookSecret,
      livemode: /^(sk|rk)_live_/.test(key),
    });
  }),
);

// Subscriptions mirrored from Stripe, newest first.
billingRouter.get(
  '/subscriptions',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const subscriptions = await Subscription.find().sort({ createdAt: -1 }).limit(500);
    res.json(subscriptions);
  }),
);
