import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV ?? 'development';
const isProdEnv = nodeEnv === 'production';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Value that MUST be provided in production (secrets, admin credentials). In
 * production a missing value throws at boot; in dev an insecure fallback keeps
 * local runs frictionless. This is what prevents shipping with a known secret.
 */
function requiredInProd(name: string, devFallback: string): string {
  const value = process.env[name];
  if (value && value.trim()) return value;
  if (isProdEnv) {
    throw new Error(`Missing required environment variable in production: ${name}`);
  }
  return devFallback;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv,
  databaseUrl: required(
    'DATABASE_URL',
    'mongodb://root:juno@localhost:27017/juno?authSource=admin&directConnection=true',
  ),
  jwtSecret: requiredInProd('JWT_SECRET', 'dev-insecure-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '12h',
  // Back-office admin — authenticated straight from the environment (no DB user).
  adminEmail: requiredInProd('ADMIN_EMAIL', 'admin@juno.studio'),
  adminPassword: requiredInProd('ADMIN_PASSWORD', 'change-me'),
  // Comma-separated list of allowed origins for CORS (front-end dev server, etc.)
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:4200')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  mail: {
    // Resend API key. Required in production so lead notifications actually send;
    // when empty (dev without a key) the mailer logs instead of sending.
    resendApiKey: process.env.RESEND_API_KEY ?? '',
    // Sender identity. Must use a domain verified in Resend in production;
    // `onboarding@resend.dev` is Resend's sandbox sender (delivers only to the
    // account owner) and is fine for local testing.
    from: process.env.MAIL_FROM ?? 'JUNO <onboarding@resend.dev>',
    // Optional reply-to on the client recap, so replies reach the team inbox.
    replyTo: process.env.MAIL_REPLY_TO ?? '',
    // Internal recipients for the "new lead" notification (you, Juno, Noah…).
    internalRecipients: (process.env.MAIL_INTERNAL_RECIPIENTS ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
    // Base URL of the back-office, used to deep-link the lead in the notification.
    backofficeUrl: process.env.BACKOFFICE_URL ?? '',
    // Signing secret for Resend delivery webhooks (empty = signature check skipped
    // in dev; required in production so forged events are rejected).
    resendWebhookSecret: process.env.RESEND_WEBHOOK_SECRET ?? '',
  },
  // Anti-spam: minimum time (ms) a human takes to fill the multi-step intake.
  // A submission faster than this (with a client timestamp) is dropped as a bot.
  antispamMinFillMs: Number(process.env.ANTISPAM_MIN_FILL_MS ?? 2500),
} as const;

export const isProd = isProdEnv;
