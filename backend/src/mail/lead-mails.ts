import { config } from '../config';
import { sendMail } from './mailer';
import {
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

/**
 * Fire both lead emails (team notification + client recap). Best-effort: never
 * throws — failures are logged so a mail problem can't break lead intake.
 * Returns which sends succeeded.
 */
export async function sendLeadEmails(
  lead: LeadForMail,
): Promise<{ internal: boolean; client: boolean }> {
  const result = { internal: false, client: false };

  const createdAt = dateFmt.format(lead.createdAt ? new Date(lead.createdAt) : new Date());
  const typeLabel = escapeHtml(lead.type);
  const secteur = escapeHtml(lead.secteur);
  const pagesHtml = chips(lead.pages ?? []);
  const stylesHtml = chips(lead.styles ?? []);
  const colorsHtml = colorSwatches(lead.colors ?? []);

  // ---- Internal notification (you, Juno, Noah) ----
  try {
    if (config.mail.internalRecipients.length > 0) {
      const ctaHtml = config.mail.backofficeUrl
        ? `<a href="${escapeHtml(config.mail.backofficeUrl)}" style="display:inline-block;background:#8cc63f;color:#0f172a;font-weight:700;text-decoration:none;padding:12px 22px;border-radius:10px;font-size:14px;">Ouvrir dans le back-office →</a>`
        : '';

      const html = await renderLeadInternal({
        nom: escapeHtml(lead.nom),
        email: escapeHtml(lead.email),
        tel: orDash(lead.tel),
        secteur,
        typeLabel,
        existantLabel: escapeHtml(EXISTANT_LABELS[lead.existant] ?? lead.existant),
        budget: orDash(lead.budget),
        echeance: orDash(lead.echeance),
        pagesHtml,
        stylesHtml,
        colorsHtml,
        refs: orDash(lead.refs),
        message: orDash(lead.message),
        createdAt: escapeHtml(createdAt),
        ctaHtml,
      });

      result.internal = await sendMail({
        to: config.mail.internalRecipients,
        subject: `Nouvelle demande — ${lead.nom} (${lead.type})`,
        html,
      });
    }
  } catch (err) {
    console.error('[JUNO][mail] internal notification failed', err);
  }

  // ---- Client recap ----
  try {
    const html = await renderLeadClient({
      prenom: firstName(lead.nom),
      typeLabel,
      secteur,
      pagesHtml,
      stylesHtml,
      colorsHtml,
    });

    result.client = await sendMail({
      to: lead.email,
      subject: 'Merci ! On a bien reçu votre demande — JUNO',
      html,
      replyTo: config.mail.replyTo || undefined,
    });
  } catch (err) {
    console.error('[JUNO][mail] client recap failed', err);
  }

  return result;
}
