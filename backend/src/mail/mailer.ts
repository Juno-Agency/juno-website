import { Resend } from 'resend';
import { config } from '../config';

const resend = config.mail.resendApiKey ? new Resend(config.mail.resendApiKey) : null;

export interface SendMailInput {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Send one email through Resend. When no API key is configured (typical in local
 * dev) it logs instead of throwing, so the lead flow keeps working end-to-end
 * without credentials. Returns true on a real send.
 */
export async function sendMail({ to, subject, html, replyTo }: SendMailInput): Promise<boolean> {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : to ? [to] : [];
  if (recipients.length === 0) return false;

  if (!resend) {
    console.log(`[JUNO][mail:dev] would send "${subject}" → ${recipients.join(', ')}`);
    return false;
  }

  const { error } = await resend.emails.send({
    from: config.mail.from,
    to: recipients,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    console.error(`[JUNO][mail] send failed "${subject}":`, error);
    return false;
  }
  return true;
}
