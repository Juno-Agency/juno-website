import { Connection, createConnection } from 'mongoose';

/**
 * Où vivent les tickets.
 *
 * Par défaut : dans la base de l'application, comme le reste. Mais si
 * `TICKETS_DATABASE_URL` est renseignée, les modèles `Ticket` et `Counter`
 * passent par une connexion dédiée vers cette base-là.
 *
 * C'est ce qui permet, en développement, de travailler sur le backlog partagé
 * de production tout en gardant leads et portfolio en local : une seule API —
 * celle qui tourne sur votre machine — donc aucun jeton d'authentification à
 * faire coïncider entre deux serveurs. En production la variable est absente,
 * et tout se comporte comme avant.
 */

/** Mémorisée pour que Ticket et Counter partagent la même connexion. */
let shared: Connection | null = null;

export function resolveTicketsConnection(
  defaultConnection: Connection,
  uri: string,
  create: (uri: string) => Connection = createConnection,
): Connection {
  if (!uri.trim()) return defaultConnection;
  shared ??= create(uri);
  return shared;
}

/** Ferme la connexion dédiée si elle a été ouverte (arrêt propre du serveur). */
export async function closeTicketsConnection(): Promise<void> {
  if (!shared) return;
  await shared.close();
  shared = null;
}
