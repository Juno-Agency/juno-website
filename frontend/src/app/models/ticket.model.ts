/** Colonnes du backlog interne. Miroir de backend/src/tickets/ticket.schema.ts. */
export const TICKET_STATUSES = ['TODO', 'DOING', 'DONE'] as const;
export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;

export type TicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

/** Libellés affichés. Les valeurs stockées restent les codes ci-dessus. */
export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  TODO: 'À faire',
  DOING: 'En cours',
  DONE: 'Fait',
};

export const TICKET_PRIORITY_LABEL: Record<TicketPriority, string> = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
};

export interface Ticket {
  id: string;
  /** Identifiant lisible attribué par l'API : JUNO-01, JUNO-02… */
  key: string;
  seq: number;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  updatedAt: string;
}

/** Ce que le formulaire envoie — la clé est attribuée côté serveur. */
export interface TicketDraft {
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
}

export function emptyTicketDraft(): TicketDraft {
  return { title: '', description: '', status: 'TODO', priority: 'MEDIUM' };
}

export function toTicketDraft(t: Ticket): TicketDraft {
  return {
    title: t.title,
    description: t.description,
    status: t.status,
    priority: t.priority,
  };
}
