import { describe, expect, it } from 'vitest';

import { sortTickets } from './ticket-sort';
import { Ticket, TicketPriority, TicketStatus } from './ticket.model';

/** Ticket minimal : seuls seq, priorité et statut comptent pour le tri. */
function t(seq: number, priority: TicketPriority, status: TicketStatus = 'TODO'): Ticket {
  return {
    id: `id-${seq}`,
    key: `JUNO-${String(seq).padStart(2, '0')}`,
    seq,
    title: `Ticket ${seq}`,
    description: '',
    status,
    priority,
    assignee: null,
    createdAt: '2026-08-24T10:00:00.000Z',
    updatedAt: '2026-08-24T10:00:00.000Z',
  };
}

const keys = (list: Ticket[]) => list.map((x) => x.key);

describe('sortTickets', () => {
  it('remonte les priorités hautes', () => {
    const sorted = sortTickets([t(1, 'LOW'), t(2, 'HIGH'), t(3, 'MEDIUM')]);
    expect(keys(sorted)).toEqual(['JUNO-02', 'JUNO-03', 'JUNO-01']);
  });

  it('départage une priorité égale par le numéro décroissant', () => {
    const sorted = sortTickets([t(4, 'HIGH'), t(9, 'HIGH'), t(7, 'HIGH')]);
    expect(keys(sorted)).toEqual(['JUNO-09', 'JUNO-07', 'JUNO-04']);
  });

  it('ignore le statut : le tri s’applique à l’intérieur d’une colonne', () => {
    const sorted = sortTickets([t(1, 'LOW', 'DONE'), t(2, 'HIGH', 'TODO')]);
    expect(keys(sorted)).toEqual(['JUNO-02', 'JUNO-01']);
  });

  it('ne modifie pas le tableau reçu', () => {
    // La liste vient d'un signal : la trier en place ferait muter l'état.
    const input = [t(1, 'LOW'), t(2, 'HIGH')];
    const before = keys(input);
    sortTickets(input);
    expect(keys(input)).toEqual(before);
  });

  it('supporte une liste vide', () => {
    expect(sortTickets([])).toEqual([]);
  });
});
