import { describe, expect, it } from 'vitest';

import { requireAuth } from '../auth/auth.middleware';
import { leadsRouter } from './leads.routes';

/**
 * La clé LEADS_API_KEY ne doit ouvrir que la lecture (liste et détail). On lit
 * la pile du routeur : toute autre route du back-office garde `requireAuth`
 * seul, sans voie par clé.
 */
type Layer = { route?: { path: string; methods: Record<string, boolean>; stack: { handle: unknown }[] } };

const routes = (leadsRouter.stack as Layer[])
  .filter((l) => l.route)
  .map((l) => ({
    key: `${Object.keys(l.route!.methods)[0].toUpperCase()} ${l.route!.path}`,
    handles: l.route!.stack.map((s) => s.handle),
  }));

const guard = (key: string) => routes.find((r) => r.key === key)?.handles[0];

describe('accès aux leads', () => {
  it('liste et détail acceptent la clé de lecture en plus du JWT', () => {
    for (const key of ['GET /', 'GET /:id']) {
      const g = guard(key);
      expect(g, key).toBeTypeOf('function');
      expect(g, key).not.toBe(requireAuth);
    }
    expect(guard('GET /')).toBe(guard('GET /:id'));
  });

  it('stats, modification, renvoi et suppression restent au seul JWT', () => {
    for (const key of ['GET /stats', 'PATCH /:id', 'POST /:id/resend', 'DELETE /:id']) {
      expect(guard(key), key).toBe(requireAuth);
    }
  });
});
