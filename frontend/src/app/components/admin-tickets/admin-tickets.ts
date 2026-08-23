import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';

import { TicketService } from '../../services/ticket.service';
import {
  TICKET_ASSIGNEES,
  TICKET_ASSIGNEE_LABEL,
  TICKET_PRIORITIES,
  TICKET_PRIORITY_LABEL,
  TICKET_STATUSES,
  TICKET_STATUS_LABEL,
  Ticket,
  TicketAssignee,
  TicketDraft,
  TicketPriority,
  TicketStatus,
  emptyTicketDraft,
  toTicketDraft,
} from '../../models/ticket.model';

/**
 * Backlog interne : ce qu'il reste à faire sur JUNO. Les identifiants
 * (JUNO-01, JUNO-02…) sont attribués par l'API, jamais ici.
 */
@Component({
  selector: 'app-admin-tickets',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-tickets.html',
  styleUrl: './admin-tickets.scss',
})
export class AdminTicketsComponent implements OnInit {
  private readonly api = inject(TicketService);

  protected readonly STATUSES = TICKET_STATUSES;
  protected readonly PRIORITIES = TICKET_PRIORITIES;
  protected readonly ASSIGNEES = TICKET_ASSIGNEES;
  protected readonly statusLabel = TICKET_STATUS_LABEL;
  protected readonly priorityLabel = TICKET_PRIORITY_LABEL;
  protected readonly assigneeLabel = TICKET_ASSIGNEE_LABEL;

  protected readonly tickets = signal<Ticket[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  /** null = tous les statuts. */
  protected readonly filter = signal<TicketStatus | null>(null);
  /** null = tout le monde ; 'NONE' = les tickets que personne n'a pris. */
  protected readonly whoFilter = signal<TicketAssignee | 'NONE' | null>(null);

  protected readonly editorOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly draft = signal<TicketDraft>(emptyTicketDraft());
  protected readonly saving = signal(false);
  protected readonly confirmDeleteId = signal<string | null>(null);

  protected readonly isEditing = computed(() => this.editingId() !== null);

  /**
   * Le filtre s'applique côté client : la liste tient en mémoire (200 tickets au
   * plus) et on évite un aller-retour réseau à chaque clic d'onglet.
   */
  protected readonly visible = computed(() => {
    const status = this.filter();
    const who = this.whoFilter();
    return this.tickets().filter((t) => {
      if (status && t.status !== status) return false;
      if (who === 'NONE') return t.assignee === null;
      if (who && t.assignee !== who) return false;
      return true;
    });
  });

  /** Compteur par statut, pour les pastilles des filtres. */
  protected readonly counts = computed(() => {
    const all = this.tickets();
    return {
      TODO: all.filter((t) => t.status === 'TODO').length,
      DOING: all.filter((t) => t.status === 'DOING').length,
      DONE: all.filter((t) => t.status === 'DONE').length,
    } satisfies Record<TicketStatus, number>;
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.api.list().subscribe({
      next: (tickets) => {
        this.tickets.set(tickets);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les tickets.');
        this.loading.set(false);
      },
    });
  }

  protected setFilter(status: TicketStatus | null): void {
    this.filter.set(status);
  }

  /** Le select renvoie '' pour « tout le monde » : les valeurs HTML sont des chaînes. */
  protected setWhoFilter(value: string): void {
    this.whoFilter.set(value === '' ? null : (value as TicketAssignee | 'NONE'));
  }

  /** Idem sur une ligne : '' signifie « rendre au backlog », donc null en base. */
  protected setAssignee(t: Ticket, value: string): void {
    const assignee = value === '' ? null : (value as TicketAssignee);
    if (assignee === t.assignee) return;
    this.applyInline(t, { assignee });
  }

  protected patch(part: Partial<TicketDraft>): void {
    this.draft.update((d) => ({ ...d, ...part }));
  }

  protected openNew(): void {
    this.draft.set(emptyTicketDraft());
    this.editingId.set(null);
    this.error.set('');
    this.editorOpen.set(true);
  }

  protected openEdit(t: Ticket): void {
    this.draft.set(toTicketDraft(t));
    this.editingId.set(t.id);
    this.error.set('');
    this.editorOpen.set(true);
  }

  protected close(): void {
    this.editorOpen.set(false);
    this.confirmDeleteId.set(null);
  }

  protected save(): void {
    const draft = this.draft();
    if (!draft.title.trim()) {
      this.error.set('Le titre est obligatoire.');
      return;
    }
    if (this.saving()) return;

    this.saving.set(true);
    const id = this.editingId();
    const request = id ? this.api.update(id, draft) : this.api.create(draft);

    request.subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.upsert(saved);
        this.editorOpen.set(false);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Enregistrement impossible. Réessayez.');
      },
    });
  }

  /** Changement de statut ou de priorité directement depuis la ligne. */
  protected setStatus(t: Ticket, status: TicketStatus): void {
    if (status === t.status) return;
    this.applyInline(t, { status });
  }

  protected setPriority(t: Ticket, priority: TicketPriority): void {
    if (priority === t.priority) return;
    this.applyInline(t, { priority });
  }

  /**
   * Écrit d'abord dans la liste, puis envoie : le back-office est utilisé au
   * clavier et à la souris à la chaîne, une attente réseau par changement de
   * statut serait pénible. En cas d'échec on remet la valeur précédente et on
   * le dit — pas de modification silencieusement perdue.
   */
  private applyInline(t: Ticket, patch: Partial<TicketDraft>): void {
    const previous = t;
    this.upsert({ ...t, ...patch });
    this.api.update(t.id, patch).subscribe({
      next: (saved) => this.upsert(saved),
      error: () => {
        this.upsert(previous);
        this.error.set('Modification non enregistrée.');
      },
    });
  }

  protected askDelete(id: string): void {
    this.confirmDeleteId.set(id);
  }

  protected cancelDelete(): void {
    this.confirmDeleteId.set(null);
  }

  protected doDelete(id: string): void {
    this.api.remove(id).subscribe({
      next: () => {
        this.tickets.update((list) => list.filter((t) => t.id !== id));
        this.confirmDeleteId.set(null);
      },
      error: () => {
        this.confirmDeleteId.set(null);
        this.error.set('Suppression impossible.');
      },
    });
  }

  /** Remplace le ticket s'il est déjà là, l'ajoute en tête sinon. */
  private upsert(ticket: Ticket): void {
    this.tickets.update((list) => {
      const i = list.findIndex((t) => t.id === ticket.id);
      if (i === -1) return [ticket, ...list];
      const next = [...list];
      next[i] = ticket;
      return next;
    });
  }

  protected formatDate(iso: string): string {
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
      ? '—'
      : d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
  }
}
