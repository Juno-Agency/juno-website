import { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError } from './http-error';
import { isProd } from '../config';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Route introuvable' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }
  // Unexpected error — log it, hide internals in production.
  console.error('[JUNO] unhandled error', err);
  res.status(500).json({
    error: 'Erreur interne du serveur',
    ...(isProd ? {} : { detail: String(err) }),
  });
};
