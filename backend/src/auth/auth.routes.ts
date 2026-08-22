import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { AdminUser } from '../models';
import { registry } from '../openapi/registry';
import { asyncHandler, validateBody } from '../middleware/validate';
import { unauthorized } from '../middleware/http-error';
import { LoginInput, LoginSchema, TokenSchema } from './auth.schema';
import { signToken } from './jwt';
import { config } from '../config';

export const authRouter = Router();

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
    const admin = await AdminUser.findOne({ email });
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      throw unauthorized('Identifiants invalides');
    }
    const token = signToken({ sub: admin.id, email: admin.email });
    res.json({ token, expiresIn: config.jwtExpiresIn });
  }),
);
