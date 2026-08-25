/**
 * Authentification du backlog : deux portes vers les mêmes tickets.
 *
 *   navigateur (back-office)      → Authorization: Bearer <jwt admin>
 *   curl / script / front local   → x-api-key: <TICKETS_API_KEY>
 *
 * La seconde existe parce que le backlog est partagé : on doit pouvoir le lire
 * et l'écrire depuis un poste de dev ou un script, sans session de navigateur.
 * Elle ne s'active que si `TICKETS_API_KEY` est renseignée — un déploiement qui
 * ne la définit pas reste protégé par le seul JWT, sans configuration à faire.
 *
 * La clé donne un accès complet en écriture et suppression : elle ne doit jamais
 * finir dans un bundle front. Côté développement c'est le proxy du serveur de
 * dev qui l'ajoute (voir frontend/proxy.conf.prod.mjs), pas le navigateur.
 */
import { timingSafeEqual } from 'node:crypto';
import { RequestHandler } from 'express';

import { config } from '../config';
import { requireAuth } from '../auth/auth.middleware';

/**
 * Compare la clé reçue à celle attendue, à durée constante — une comparaison
 * `===` fuit la longueur du préfixe correct et rend la clé devinable octet par
 * octet. Une clé attendue vide signifie « pas de clé configurée » : on refuse
 * tout, plutôt que de laisser un en-tête vide ouvrir la route.
 */
export function matchesTicketKey(expected: string, received: string): boolean {
  if (!expected || !received) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  // timingSafeEqual exige des longueurs égales ; l'écart est déjà une réponse.
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/**
 * Construit le garde des routes tickets. Les dépendances sont injectées pour
 * que le comportement soit testable sans lever de serveur ni signer de JWT.
 */
export function ticketAccess(expectedKey: string, jwtGuard: RequestHandler): RequestHandler {
  return (req, res, next) => {
    const received = req.headers['x-api-key'];
    if (typeof received === 'string' && matchesTicketKey(expectedKey, received)) {
      return next();
    }
    // Pas de clé, ou mauvaise clé : le JWT reste la voie normale. On ne renvoie
    // pas 401 tout de suite, sinon le back-office authentifié serait bloqué.
    return jwtGuard(req, res, next);
  };
}

/** Garde effectivement monté sur `/api/tickets`. */
export const requireTicketAccess = ticketAccess(config.ticketsApiKey, requireAuth);
