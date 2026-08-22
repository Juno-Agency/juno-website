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
} as const;

export const isProd = isProdEnv;
