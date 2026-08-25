import rateLimit from 'express-rate-limit';

/** Strict limiter on the admin login — blunts password brute-forcing. */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 attempts per IP per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Trop de tentatives de connexion. Réessayez dans un instant.' },
});

/** Moderate limiter on the public lead form — blunts spam submissions. */
export const createLeadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 20, // 20 submissions per IP per hour
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Trop de demandes envoyées. Réessayez plus tard.' },
});

/** Limiter on the public duplicate pre-check — blunts email enumeration. */
export const checkLeadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 30, // 30 checks per IP per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Trop de requêtes. Réessayez dans un instant.' },
});

/**
 * Limiter on the shared ticket backlog. The API-key door is reachable from
 * anywhere, so this is what blunts a brute-force on the key itself.
 */
export const ticketsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 300, // roomy for a kanban board, useless for guessing a key
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Trop de requêtes sur le backlog. Réessayez dans un instant.' },
});
