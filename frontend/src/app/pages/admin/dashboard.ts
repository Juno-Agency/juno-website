import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { AdminService } from '../../core/admin.service';
import {
  AdminLead,
  EXISTING_LABEL,
  EditableLead,
  LEAD_STATUSES,
  LeadStatus,
  STATUS_META,
  toEditable,
} from '../../core/admin.model';
import { PAGES, SECTORS, STYLES, SWATCHES } from '../intake/intake.data';

type Filter = LeadStatus | 'ALL';
type Mode = 'view' | 'edit';

const BUDGETS = [
  'Moins de 1 000 €',
  '1 000 – 3 000 €',
  '3 000 – 6 000 €',
  'Plus de 6 000 €',
  'À définir ensemble',
];
const ECHEANCES = ['Dès que possible', 'Sous 1 mois', '1 à 3 mois', 'Pas de date précise'];
const SITE_TYPES = ['Site vitrine', 'Boutique en ligne', 'Application web'];

@Component({
  selector: 'app-admin-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class AdminDashboardComponent implements OnInit {
  private readonly admin = inject(AdminService);

  // Reference data for the edit form.
  protected readonly statuses = LEAD_STATUSES;
  protected readonly statusMeta = STATUS_META;
  protected readonly existingLabel = EXISTING_LABEL;
  protected readonly sectors = SECTORS;
  protected readonly pageOptions = PAGES;
  protected readonly styleOptions = STYLES;
  protected readonly swatches = SWATCHES;
  protected readonly budgets = BUDGETS;
  protected readonly echeances = ECHEANCES;
  protected readonly siteTypes = SITE_TYPES;

  protected readonly leads = signal<AdminLead[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly filter = signal<Filter>('ALL');
  protected readonly search = signal('');

  protected readonly modalId = signal<string | null>(null);
  protected readonly mode = signal<Mode>('view');
  protected readonly draft = signal<EditableLead | null>(null);
  protected readonly saving = signal(false);
  protected readonly deleting = signal(false);
  protected readonly confirmDelete = signal(false);
  protected readonly busyStatus = signal(false);

  protected readonly selected = computed(() => {
    const id = this.modalId();
    return id ? (this.leads().find((l) => l.id === id) ?? null) : null;
  });

  protected readonly counts = computed(() => {
    const acc: Record<string, number> = { ALL: this.leads().length };
    for (const s of this.statuses) acc[s] = 0;
    for (const l of this.leads()) acc[l.status] = (acc[l.status] ?? 0) + 1;
    return acc;
  });

  protected readonly visibleLeads = computed(() => {
    const f = this.filter();
    const q = this.search().trim().toLowerCase();
    return this.leads().filter((l) => {
      if (f !== 'ALL' && l.status !== f) return false;
      if (!q) return true;
      return [l.nom, l.email, l.secteur, l.type].some((v) =>
        v.toLowerCase().includes(q),
      );
    });
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');
    this.admin.getLeads().subscribe({
      next: (leads) => {
        this.leads.set(leads);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Impossible de charger les demandes.');
      },
    });
  }

  protected setFilter(f: Filter): void {
    this.filter.set(f);
  }
  protected onSearch(ev: Event): void {
    this.search.set((ev.target as HTMLInputElement).value);
  }

  /* ---------- modal ---------- */
  protected open(lead: AdminLead, mode: Mode = 'view'): void {
    this.modalId.set(lead.id);
    this.mode.set(mode);
    this.confirmDelete.set(false);
    this.error.set('');
    if (mode === 'edit') this.draft.set(toEditable(lead));
  }
  protected close(): void {
    this.modalId.set(null);
    this.draft.set(null);
    this.confirmDelete.set(false);
  }
  protected startEdit(): void {
    const l = this.selected();
    if (l) {
      this.draft.set(toEditable(l));
      this.mode.set('edit');
    }
  }
  protected cancelEdit(): void {
    this.draft.set(null);
    this.mode.set('view');
  }

  /* ---------- edit form helpers ---------- */
  protected setField<K extends keyof EditableLead>(
    key: K,
    value: EditableLead[K],
  ): void {
    this.draft.update((d) => (d ? { ...d, [key]: value } : d));
  }
  protected setText(key: keyof EditableLead, ev: Event): void {
    const v = (ev.target as HTMLInputElement | HTMLTextAreaElement).value;
    this.setField(key, v as EditableLead[typeof key]);
  }
  protected setNullable(key: 'tel' | 'budget' | 'echeance' | 'message', ev: Event): void {
    const v = (ev.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
    this.setField(key, (v.trim() ? v : null) as EditableLead[typeof key]);
  }
  protected toggleArray(key: 'pages' | 'styles' | 'colors', value: string): void {
    this.draft.update((d) => {
      if (!d) return d;
      const arr = d[key].slice();
      const i = arr.indexOf(value);
      if (i >= 0) arr.splice(i, 1);
      else arr.push(value);
      return { ...d, [key]: arr };
    });
  }
  protected toggleColor(c: string): void {
    this.toggleArray('colors', c);
  }
  protected inArray(key: 'pages' | 'styles' | 'colors', value: string): boolean {
    const d = this.draft();
    return !!d && d[key].includes(value);
  }

  /* ---------- persistence ---------- */
  protected save(): void {
    const id = this.modalId();
    const d = this.draft();
    if (!id || !d || this.saving()) return;
    if (!d.nom.trim() || !d.email.trim()) {
      this.error.set('Le nom et l’email sont requis.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    this.admin.update(id, d).subscribe({
      next: (updated) => {
        this.applyUpdate(updated);
        this.saving.set(false);
        this.mode.set('view');
        this.draft.set(null);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Échec de l’enregistrement.');
      },
    });
  }

  protected changeStatus(status: LeadStatus): void {
    const l = this.selected();
    if (!l || l.status === status || this.busyStatus()) return;
    this.busyStatus.set(true);
    this.admin.updateStatus(l.id, status).subscribe({
      next: (updated) => {
        this.applyUpdate(updated);
        this.busyStatus.set(false);
      },
      error: () => {
        this.busyStatus.set(false);
        this.error.set('Échec de la mise à jour du statut.');
      },
    });
  }

  protected openDelete(lead: AdminLead): void {
    this.open(lead, 'view');
    this.confirmDelete.set(true);
  }
  protected askDelete(): void {
    this.confirmDelete.set(true);
  }
  protected cancelDelete(): void {
    this.confirmDelete.set(false);
  }
  protected doDelete(): void {
    const id = this.modalId();
    if (!id || this.deleting()) return;
    this.deleting.set(true);
    this.admin.remove(id).subscribe({
      next: () => {
        this.leads.update((list) => list.filter((l) => l.id !== id));
        this.deleting.set(false);
        this.close();
      },
      error: () => {
        this.deleting.set(false);
        this.error.set('Échec de la suppression.');
      },
    });
  }

  private applyUpdate(updated: AdminLead): void {
    this.leads.update((list) =>
      list.map((l) => (l.id === updated.id ? updated : l)),
    );
  }

  /* ---------- misc ---------- */
  protected fmtDate(iso: string): string {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  }
  protected initials(name: string): string {
    return (
      name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase() ?? '')
        .join('') || '?'
    );
  }
}
