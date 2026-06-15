import { z } from '../openapi/zod';
import { registry } from '../openapi/registry';

export const LoginSchema = registry.register(
  'Login',
  z
    .object({
      email: z.string().email().openapi({ example: 'admin@juno.studio' }),
      password: z.string().min(1).openapi({ example: 'change-me' }),
    })
    .openapi('Login'),
);

export type LoginInput = z.infer<typeof LoginSchema>;

export const TokenSchema = registry.register(
  'Token',
  z
    .object({
      token: z.string(),
      expiresIn: z.string().openapi({ example: '12h' }),
    })
    .openapi('Token'),
);
