/**
 * Attribution des identifiants de tickets (`JUNO-01`, `JUNO-02`, …).
 *
 * Le numéro ne vient pas du nombre de tickets existants : il vient d'un
 * compteur dédié, incrémenté atomiquement. Deux créations simultanées reçoivent
 * donc deux numéros distincts, et supprimer un ticket ne libère pas le sien —
 * un identifiant désigne une fois pour toutes le même ticket, y compris dans
 * une conversation où on continue de le citer après sa suppression.
 */

/** Identifiant du document compteur, dans la collection `counters`. */
export const TICKET_COUNTER_ID = 'ticket';

/** Ce qu'on attend du modèle compteur — de quoi le remplacer en test. */
export interface CounterModel {
  findOneAndUpdate(
    filter: { _id: string },
    update: { $inc: { value: number } },
    options: { upsert: boolean; new: boolean },
  ): Promise<{ value?: number | null } | null>;
}

/**
 * Met le numéro au format d'affichage : deux chiffres au minimum, davantage
 * au-delà de 99 (`JUNO-100`) plutôt qu'un débordement silencieux.
 */
export function formatTicketKey(seq: number): string {
  if (!Number.isInteger(seq) || seq < 1) {
    throw new Error(`Numéro de ticket invalide : ${seq}`);
  }
  return `JUNO-${String(seq).padStart(2, '0')}`;
}

/**
 * Réserve le prochain numéro. `$inc` sur un document unique est atomique côté
 * serveur Mongo, ce qui suffit ici : pas besoin de la transaction (et donc du
 * replica set) que réclamait Prisma.
 */
export async function nextTicketSeq(counter: CounterModel): Promise<number> {
  const doc = await counter.findOneAndUpdate(
    { _id: TICKET_COUNTER_ID },
    { $inc: { value: 1 } },
    { upsert: true, new: true },
  );
  const value = doc?.value;
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 1) {
    throw new Error('Le compteur de tickets n’a pas renvoyé de numéro exploitable');
  }
  return value;
}
