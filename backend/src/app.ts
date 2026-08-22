import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { config, isProd } from './config';
import { authRouter } from './auth/auth.routes';
import { leadsRouter } from './leads/leads.routes';
import { webhooksRouter } from './webhooks/resend.routes';
import { errorHandler, notFoundHandler } from './middleware/error';
import { buildOpenApiDocument } from './openapi/document';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  // Trust Render's reverse proxy so `req.ip` is the real client IP (rate limiting).
  app.set('trust proxy', 1);
  // Full security headers (incl. CSP) in production. In development the CSP is
  // relaxed so the Swagger UI's inline assets render.
  app.use(helmet(isProd ? {} : { contentSecurityPolicy: false }));
  app.use(cors({ origin: config.corsOrigins, credentials: true }));
  app.use(morgan(isProd ? 'combined' : 'dev'));

  // Webhooks need the raw request body for signature verification, so they are
  // mounted before the JSON body parser (which would otherwise consume the body).
  app.use('/api/webhooks', webhooksRouter);

  app.use(express.json({ limit: '256kb' }));

  // Health check.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'juno-api' });
  });

  // Feature routers.
  app.use('/api/leads', leadsRouter);
  app.use('/api/auth', authRouter);

  // API docs (spec generated from the Zod schemas) — DEVELOPMENT ONLY, so the
  // full API surface (incl. admin routes) is never exposed publicly in prod.
  if (!isProd) {
    const openApiDoc = buildOpenApiDocument();
    app.get('/api/docs.json', (_req, res) => res.json(openApiDoc));
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));
  }

  // Fallbacks.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
