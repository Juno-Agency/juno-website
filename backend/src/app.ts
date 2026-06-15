import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';

import { config, isProd } from './config';
import { authRouter } from './auth/auth.routes';
import { leadsRouter } from './leads/leads.routes';
import { errorHandler, notFoundHandler } from './middleware/error';
import { buildOpenApiDocument } from './openapi/document';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  // Swagger UI ships inline assets; relax CSP so the docs render.
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors({ origin: config.corsOrigins, credentials: true }));
  app.use(express.json({ limit: '256kb' }));
  app.use(morgan(isProd ? 'combined' : 'dev'));

  // Health check.
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'juno-api' });
  });

  // Feature routers.
  app.use('/api/leads', leadsRouter);
  app.use('/api/auth', authRouter);

  // Swagger docs (spec generated from the Zod schemas).
  const openApiDoc = buildOpenApiDocument();
  app.get('/api/docs.json', (_req, res) => res.json(openApiDoc));
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDoc));

  // Fallbacks.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
