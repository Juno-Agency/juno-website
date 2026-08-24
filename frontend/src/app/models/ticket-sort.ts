import { Ticket, TicketPriority } from './ticket.model';

/** Poids de tri : plus le nombre est grand, plus la carte remonte. */
const PRIORITY_WEIGHT: Record<TicketPriority, number> = {
  HIGH: 2,
  MEDIUM: 1,
  LOW: 0,
};

/**
 * Ordre des cartes à l'intérieur d'une colonne : priorité décroissante, puis
 * numéro décroissant (le plus récent d'abord).
 *
 * Le tri est automatique et non modifiable : à deux sur un même tableau, un
 * ordre manuel voudrait dire que chacun voit une pile différente selon qui a
 * bougé quoi en dernier. Ici la colonne se lit de la même façon pour tout le
 * monde, et la priorité est le seul levier pour faire remonter un ticket.
 */
export function sortTickets(tickets: Ticket[]): Ticket[] {
  // Copie : la liste vient d'un signal, la trier en place ferait muter l'état.
  return [...tickets].sort((a, b) => {
    const byPriority = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    return byPriority !== 0 ? byPriority : b.seq - a.seq;
  });
}
