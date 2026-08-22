import { config } from '../config';
import { Lead } from '../models';
import { sendMail } from './mailer';
import {
  blobAttachment,
  chips,
  colorSwatches,
  escapeHtml,
  renderLeadClient,
  renderLeadInternal,
} from './render';

/** Minimal shape needed to build the emails — matches a created Lead document. */
export interface LeadForMail {
  id: string;
  nom: string;
  email: string;
  tel?: string | null;
  secteur: string;
  existant: string;
  type: string;
  pages: string[];
  styles: string[];
  refs?: string | null;
  colors: string[];
  budget?: string | null;
  echeance?: string | null;
  message?: string | null;
  createdAt?: Date | string;
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'full',
  timeStyle: 'short',
  timeZone: 'Europe/Paris',
});

const EXISTANT_LABELS: Record<string, string> = {
  refaire: 'Site existant à refaire',
  aucun: 'Aucun site (création)',
};

/** Escaped scalar, or a muted dash when empty. */
function orDash(value?: string | null): string {
  const v = (value ?? '').trim();
  return v ? escapeHtml(v) : '<span style="color:#94a3b8;">Non précisé</span>';
}

function firstName(nom: string): string {
  return escapeHtml((nom.trim().split(/\s+/)[0] || nom).trim());
}

export type EmailKind = 'internal' | 'client';
interface SentRecord {
  resendId: string;
  kind: EmailKind;
  to: string;
}

/** Render + send the internal team notification. Returns the send record or null. */
async function sendInternal(lead: LeadForMail): Promise<SentRecord | null> {
  if (config.mail.internalRecipients.length === 0) return null;
  try {
    const ctaHtml = config.mail.backofficeUrl
      ? `<a href="${escapeHtml(config.mail.backofficeUrl)}" style="display:inline-block;background:#fcfcfb;color:#141414;font-weight:600;text-decoration:none;padding:14px 28px;border-radius:3px;font-size:15px;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;">Ouvrir dans le back-office&nbsp;&rarr;</a>`
      : '';

    const html = await renderLeadInternal({
      nom: escapeHtml(lead.nom),
      email: escapeHtml(lead.email),
      tel: orDash(lead.tel),
      secteur: escapeHtml(lead.secteur),
      typeLabel: escapeHtml(lead.type),
      existantLabel: escapeHtml(EXISTANT_LABELS[lead.existant] ?? lead.existant),
      budget: orDash(lead.budget),
      echeance: orDash(lead.echeance),
      pagesHtml: chips(lead.pages ?? []),
      stylesHtml: chips(lead.styles ?? []),
      colorsHtml: colorSwatches(lead.colors ?? []),
      refs: orDash(lead.refs),
      message: orDash(lead.message),
      createdAt: escapeHtml(dateFmt.format(lead.createdAt ? new Date(lead.createdAt) : new Date())),
      ctaHtml,
    });

    const id = await sendMail({
      to: config.mail.internalRecipients,
      subject: `Nouvelle demande — ${lead.nom} (${lead.type})`,
      html,
      // Replying to the team notification writes straight to the client.
      replyTo: lead.email,
      attachments: [blobAttachment],
    });
    return id ? { resendId: id, kind: 'internal', to: config.mail.internalRecipients.join(', ') } : null;
  } catch (err) {
    console.error('[JUNO][mail] internal notification failed', err);
    return null;
  }
}

/** Render + send the client recap. Returns the send record or null. */
async function sendClient(lead: LeadForMail): Promise<SentRecord | null> {
  try {
    const html = await renderLeadClient({
      prenom: firstName(lead.nom),
      typeLabel: escapeHtml(lead.type),
      secteur: escapeHtml(lead.secteur),
      pagesHtml: chips(lead.pages ?? []),
      stylesHtml: chips(lead.styles ?? []),
      colorsHtml: colorSwatches(lead.colors ?? []),
    });

    const id = await sendMail({
      to: lead.email,
      subject: 'Merci ! On a bien reçu votre demande — JUNO',
      html,
      replyTo: config.mail.replyTo || undefined,
      attachments: [blobAttachment],
    });
    return id ? { resendId: id, kind: 'client', to: lead.email } : null;
  } catch (err) {
    console.error('[JUNO][mail] client recap failed', err);
    return null;
  }
}

/** Persist send records on the lead so delivery webhooks can correlate events. */
async function recordSent(leadId: string, sent: SentRecord[]): Promise<void> {
  if (sent.length === 0 || !leadId) return;
  try {
    await Lead.findByIdAndUpdate(leadId, {
      $push: { emails: { $each: sent.map((s) => ({ ...s, status: 'sent' as const })) } },
    });
  } catch (err) {
    console.error('[JUNO][mail] failed to record sent emails on lead', err);
  }
}

/**
 * Fire both lead emails (team notification + client recap). Best-effort: never
 * throws — failures are logged so a mail problem can't break lead intake.
 */
export async function sendLeadEmails(
  lead: LeadForMail,
): Promise<{ internal: boolean; client: boolean }> {
  const [internal, client] = await Promise.all([sendInternal(lead), sendClient(lead)]);
  await recordSent(lead.id, [internal, client].filter((r): r is SentRecord => r !== null));
  return { internal: Boolean(internal), client: Boolean(client) };
}

/**
 * Re-send one or both emails for an existing lead (back-office action). Records
 * the new sends on the lead so their delivery is tracked like the originals.
 */
export async function resendLeadEmails(
  lead: LeadForMail,
  which: 'internal' | 'client' | 'both',
): Promise<{ internal: boolean; client: boolean }> {
  const internal = which !== 'client' ? await sendInternal(lead) : null;
  const client = which !== 'internal' ? await sendClient(lead) : null;
  await recordSent(lead.id, [internal, client].filter((r): r is SentRecord => r !== null));
  return { internal: Boolean(internal), client: Boolean(client) };
}
