import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodTypeAny, z } from 'zod';
import { badRequest } from './http-error';

/**
 * Validates `req.body` against a Zod schema and replaces it with the parsed
 * (and defaulted/coerced) value. Throws a 400 with field errors on failure.
 */
export function validateBody<S extends ZodTypeAny>(schema: S): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(badRequest('Données invalides', flatten(result.error)));
    }
    req.body = result.data;
    next();
  };
}

/** Same idea for query params; parsed result is stored on `res.locals.query`. */
export function validateQuery<S extends ZodTypeAny>(schema: S): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(badRequest('Paramètres invalides', flatten(result.error)));
    }
    res.locals['query'] = result.data;
    next();
  };
}

function flatten(error: z.ZodError): Record<string, string[]> {
  return error.flatten().fieldErrors as Record<string, string[]>;
}

/** Wraps an async handler so rejected promises reach the error middleware. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
