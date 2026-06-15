import 'dotenv/config';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: required(
    'DATABASE_URL',
    'postgresql://juno:juno@localhost:5432/juno?schema=public',
  ),
  jwtSecret: required('JWT_SECRET', 'dev-insecure-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '12h',
  // Comma-separated list of allowed origins for CORS (front-end dev server, etc.)
  corsOrigins: (process.env.CORS_ORIGINS ?? 'http://localhost:4200')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
} as const;

export const isProd = config.nodeEnv === 'production';
