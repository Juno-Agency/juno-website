import { describe, expect, it } from 'vitest';

import { CreateTicketSchema, UpdateTicketSchema } from './ticket.schema';

describe('CreateTicketSchema — assignation', () => {
  it('accepte un ticket sans assigné et le laisse à null', () => {
    const parsed = CreateTicketSchema.parse({ title: 'Sans preneur' });
    expect(parsed.assignee).toBeNull();
  });

  it('accepte les membres de l’équipe', () => {
    expect(CreateTicketSchema.parse({ title: 'x', assignee: 'NOAH' }).assignee).toBe('NOAH');
    expect(CreateTicketSchema.parse({ title: 'x', assignee: 'JULIEN' }).assignee).toBe('JULIEN');
  });

  it('refuse un assigné inconnu', () => {
    expect(() => CreateTicketSchema.parse({ title: 'x', assignee: 'MALLORY' })).toThrow();
  });
});

describe('UpdateTicketSchema — désassignation', () => {
  it('accepte null pour rendre un ticket au backlog', () => {
    // Le piège : un PATCH { assignee: null } doit effacer l'assignation, pas
    // être confondu avec un champ absent (qui, lui, ne touche à rien).
    const parsed = UpdateTicketSchema.parse({ assignee: null });
    expect(parsed).toHaveProperty('assignee', null);
  });

  it('laisse le champ absent quand il n’est pas fourni', () => {
    const parsed = UpdateTicketSchema.parse({ status: 'DOING' });
    expect(parsed).not.toHaveProperty('assignee');
  });

  it('refuse un patch entièrement vide', () => {
    expect(() => UpdateTicketSchema.parse({})).toThrow();
  });
});
