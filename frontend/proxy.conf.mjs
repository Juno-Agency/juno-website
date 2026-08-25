/**
 * Proxy du serveur de dev — configuration par défaut de `npm start`.
 *
 * Tout `/api` part vers le backend local, à une exception près : le backlog de
 * tickets, partagé avec Julien, qui n'a d'intérêt qu'en un seul exemplaire.
 * Les appels `/api/tickets` sont donc envoyés à l'API de production avec la clé
 * `TICKETS_API_KEY`, ajoutée ici, côté serveur de dev. L'API la compare à la
 * sienne (backend/src/tickets/ticket-auth.ts) et répond les tickets ou 401.
 *
 * La clé ne traverse jamais le navigateur et n'entre dans aucun bundle : c'est
 * la seule façon de faire cet appel sans qu'elle fuite, puisqu'elle donne un
 * accès complet en lecture, écriture et suppression sur le backlog.
 *
 * Sans clé dans le `.env`, la règle disparaît et les tickets repartent vers le
 * backend local — un poste qui n'a pas la clé travaille sur sa propre base,
 * comme avant.
 *
 * À savoir : quand la clé est présente, les écritures de l'onglet Tickets
 * touchent la vraie base. Supprimer un ticket ici, c'est le supprimer pour tout
 * le monde. Pour travailler sur un backlog local, retirez la clé du `.env`.
 *
 * Le port du backend est lu dans `backend/.env` (`PORT`) : une seule valeur à
 * changer si le port 3000 est déjà pris sur votre machine.
 *
 * Usage :  npm start
 */
import { readEnv } from './proxy-env.mjs';

const API = 'https://juno-api-hhb0.onrender.com';
const backend = `http://localhost:${readEnv('PORT', '3000')}`;
const ticketsApiKey = readEnv('TICKETS_API_KEY');

const local = {
  target: backend,
  secure: false,
  changeOrigin: true,
  logLevel: 'debug',
};

const tickets = {
  target: API,
  secure: true,
  changeOrigin: true,
  logLevel: 'info',
  headers: { 'x-api-key': ticketsApiKey },
};

console.log(`\n\x1b[36m  /api → ${backend}\x1b[0m`);
console.log(
  ticketsApiKey
    ? `\x1b[33m  /api/tickets → ${API} (backlog partagé, écritures définitives)\x1b[0m\n`
    : '\x1b[36m  /api/tickets → backend local (pas de TICKETS_API_KEY dans le .env)\x1b[0m\n',
);

export default {
  // Le backlog d'abord : cette règle est plus spécifique que `/api` et doit être
  // évaluée avant, sinon les tickets partiraient sans la clé.
  ...(ticketsApiKey ? { '/api/tickets': tickets } : {}),
  '/api': local,
};
