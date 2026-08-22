import { Router } from 'express';
import { createHash, timingSafeEqual } from 'node:crypto';
import { registry } from '../openapi/registry';
import { asyncHandler, validateBody } from '../middleware/validate';
import { unauthorized } from '../middleware/http-error';
import { LoginInput, LoginSchema, TokenSchema } from './auth.schema';
import { signToken } from './jwt';
import { config } from '../config';

export const authRouter = Router();

/** Constant-time string comparison (hash to a fixed length first so neither
    the length nor the content leaks through timing). */
function safeEqual(a: string, b: string): boolean {
  const ha = createHash('sha256').update(a).digest();
  const hb = createHash('sha256').update(b).digest();
  return timingSafeEqual(ha, hb);
}

registry.registerPath({
  method: 'post',
  path: '/api/auth/login',
  tags: ['Auth'],
  summary: 'Authentifie un opérateur du back-office et renvoie un JWT',
  request: {
    body: { content: { 'application/json': { schema: LoginSchema } } },
  },
  responses: {
    200: {
      description: 'Jeton émis',
      content: { 'application/json': { schema: TokenSchema } },
    },
    401: { description: 'Identifiants invalides' },
  },
});

authRouter.post(
  '/login',
  validateBody(LoginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body as LoginInput;
    // Credentials live in the environment (Render), not in the database.
    const ok =
      safeEqual(email.trim().toLowerCase(), config.adminEmail.trim().toLowerCase()) &&
      safeEqual(password, config.adminPassword);
    if (!ok) throw unauthorized('Identifiants invalides');
    const token = signToken({ sub: 'admin', email: config.adminEmail });
    res.json({ token, expiresIn: config.jwtExpiresIn });
  }),
);
