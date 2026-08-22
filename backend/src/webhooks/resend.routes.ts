import { Router, raw } from 'express';
import { Webhook } from 'svix';
import { config } from '../config';
import { Lead } from '../models';
import { asyncHandler } from '../middleware/validate';

export const webhooksRouter = Router();

/** Resend event type → the status we store on the lead's email record. */
export const STATUS_BY_EVENT: Record<string, string> = {
  'email.sent': 'sent',
  'email.delivered': 'delivered',
  'email.delivery_delayed': 'delivery_delayed',
  'email.bounced': 'bounced',
  'email.complained': 'complained',
  'email.opened': 'opened',
  'email.clicked': 'clicked',
};

/**
 * Resend delivery webhook. Mounted with a raw body parser (Svix signs the exact
 * bytes), so it must be registered before the global express.json() middleware.
 * Verifies the Svix signature when a secret is configured, then updates the
 * matching email record on the lead. Always answers 200 quickly on a valid,
 * recognised event so Resend doesn't retry.
 */
webhooksRouter.post(
  '/resend',
  raw({ type: '*/*', limit: '256kb' }),
  asyncHandler(async (req, res) => {
    const payload = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : '';

    if (config.mail.resendWebhookSecret) {
      try {
        new Webhook(config.mail.resendWebhookSecret).verify(payload, {
          'svix-id': String(req.header('svix-id') ?? ''),
          'svix-timestamp': String(req.header('svix-timestamp') ?? ''),
          'svix-signature': String(req.header('svix-signature') ?? ''),
        });
      } catch {
        res.status(400).json({ error: 'Signature invalide' });
        return;
      }
    }

    let event: { type?: string; data?: { email_id?: string } };
    try {
      event = JSON.parse(payload);
    } catch {
      res.status(400).json({ error: 'Payload invalide' });
      return;
    }

    const status = event.type ? STATUS_BY_EVENT[event.type] : undefined;
    const emailId = event.data?.email_id;
    if (status && emailId) {
      await Lead.updateOne(
        { 'emails.resendId': emailId },
        { $set: { 'emails.$.status': status, 'emails.$.lastEventAt': new Date() } },
      );
    }

    res.status(200).json({ received: true });
  }),
);
