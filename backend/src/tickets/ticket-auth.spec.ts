import { Request, Response } from 'express';
import { describe, expect, it, vi } from 'vitest';

import { HttpError } from '../middleware/http-error';
import { matchesTicketKey, ticketAccess } from './ticket-auth';

/** Requête minimale : seuls les en-têtes comptent pour ce middleware. */
function req(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

const res = {} as Response;

/** Exécute le middleware et renvoie l'erreur passée à `next`, s'il y en a une. */
function run(handler: ReturnType<typeof ticketAccess>, request: Request) {
  const next = vi.fn();
  handler(request, res, next);
  return next.mock.calls[0]?.[0] as HttpError | undefined;
}

describe('matchesTicketKey', () => {
  it('accepte la clé attendue', () => {
    expect(matchesTicketKey('s3cret', 's3cret')).toBe(true);
  });

  it('refuse une clé différente', () => {
    expect(matchesTicketKey('s3cret', 'wrong')).toBe(false);
  });

  it('refuse une clé de longueur différente sans planter', () => {
    // timingSafeEqual jette si les buffers n'ont pas la même taille : le cas
    // doit être traité en amont, pas remonter en 500.
    expect(matchesTicketKey('s3cret', 's3cret-plus-long')).toBe(false);
    expect(matchesTicketKey('s3cret', '')).toBe(false);
  });

  it('refuse quand aucune clé n’est configurée', () => {
    // Sinon un serveur sans TICKETS_API_KEY accepterait un en-tête vide.
    expect(matchesTicketKey('', '')).toBe(false);
    expect(matchesTicketKey('', 'anything')).toBe(false);
  });
});

describe('ticketAccess', () => {
  const jwtOk = vi.fn((_r: Request, _s: Response, next: (e?: unknown) => void) =>
    next(),
  );
  const jwtKo = vi.fn((_r: Request, _s: Response, next: (e?: unknown) => void) =>
    next(new HttpError(401, 'Jeton manquant')),
  );

  it('laisse passer la bonne clé d’API sans toucher au JWT', () => {
    const jwt = vi.fn();
    const err = run(ticketAccess('s3cret', jwt), req({ 'x-api-key': 's3cret' }));
    expect(err).toBeUndefined();
    expect(jwt).not.toHaveBeenCalled();
  });

  it('retombe sur le JWT quand aucune clé n’est fournie', () => {
    expect(run(ticketAccess('s3cret', jwtOk), req())).toBeUndefined();
    expect(jwtOk).toHaveBeenCalled();
  });

  it('retombe sur le JWT quand la clé est mauvaise', () => {
    // Une clé erronée ne doit pas court-circuiter l'autre voie d'authentification.
    const err = run(ticketAccess('s3cret', jwtKo), req({ 'x-api-key': 'nope' }));
    expect(err?.status).toBe(401);
  });

  it('n’ouvre rien quand la clé n’est pas configurée', () => {
    // Cas d'un déploiement sans TICKETS_API_KEY : seul le JWT protège la route.
    const err = run(ticketAccess('', jwtKo), req({ 'x-api-key': '' }));
    expect(err?.status).toBe(401);
  });
});
