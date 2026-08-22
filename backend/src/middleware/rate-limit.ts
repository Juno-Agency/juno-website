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
