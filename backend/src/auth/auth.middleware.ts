import { RequestHandler } from 'express';
import { unauthorized } from '../middleware/http-error';
import { JwtPayload, verifyToken } from './jwt';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: JwtPayload;
    }
  }
}

/** Guards back-office routes: requires a valid `Authorization: Bearer <jwt>`. */
export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(unauthorized('Jeton manquant'));
  }
  try {
    req.admin = verifyToken(header.slice('Bearer '.length));
    next();
  } catch {
    next(unauthorized('Jeton invalide ou expiré'));
  }
};
