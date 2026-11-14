import { config } from '../config';
import { sendMail } from './mailer';
import { escapeHtml } from './render';

export interface SubscriptionForMail {
  email?: string | null;
  nom?: string | null;
  site?: string | null;
  formule?: string | null;
  periode: string;
  prix?: number | null;
  promo?: string | null;
  livemode?: boolean | null;
}

const EUR = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });

/**
 * Tells the team a subscription was just paid. Best effort, like every other
 * notification: a mail failure must never make the Stripe webhook fail.
 */
export async function sendSubscriptionNotification(sub: SubscriptionForMail): Promise<void> {
  if (config.mail.internalRecipients.length === 0) return;
  try {
    const who = sub.nom || sub.email || 'Un client';
    const formule = sub.formule || 'Abonnement';
    const rows: [string, string][] = [
      ['Client', who],
      ['Email', sub.email || '—'],
      ['Site', sub.site || '—'],
      ['Formule', `${formule} · ${sub.periode}`],
      ['Prix', `${EUR.format(sub.prix ?? 0)}${sub.periode === 'annuel' ? '/an' : '/mois'}`],
      ['Remise', sub.promo || '—'],
    ];
    const html = `<div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:15px;color:#141414;line-height:1.5">
<h2 style="margin:0 0 16px">Nouvel abonnement${sub.livemode ? '' : ' (mode test)'}</h2>
<table cellpadding="0" cellspacing="0" style="border-collapse:collapse">${rows
      .map(
        ([k, v]) =>
          `<tr><td style="padding:4px 16px 4px 0;color:#6b6b6b">${escapeHtml(k)}</td><td style="padding:4px 0">${escapeHtml(v)}</td></tr>`,
      )
      .join('')}</table>
${
  config.mail.backofficeUrl
    ? `<p style="margin:20px 0 0"><a href="${escapeHtml(config.mail.backofficeUrl)}">Ouvrir le back-office</a></p>`
    : ''
}</div>`;

    await sendMail({
      to: config.mail.internalRecipients,
      subject: `Nouvel abonnement — ${who} (${formule})${sub.livemode ? '' : ' [test]'}`,
      html,
      ...(sub.email ? { replyTo: sub.email } : {}),
    });
  } catch (err) {
    console.error('[JUNO][mail] subscription notification failed:', err);
  }
}
