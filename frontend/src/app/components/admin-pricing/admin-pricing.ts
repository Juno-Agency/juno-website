import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { concat, toArray } from 'rxjs';
import { PlanService } from '../../services/plan.service';
import {
  ComparisonRow,
  Plan,
  PlanDraft,
  STARTER_COMPARISON,
  PlanPromo,
  PromoScope,
  STARTER_PLANS,
  emptyPlanDraft,
  toPlanDraft,
} from '../../models/plan.model';
import { annualSaving, formatEuros, planPrice, promoRuns } from '../../utils/pricing';

/** "2026-12-31T22:59:59.000Z" → "2026-12-31" (local day), for `<input type="date">`. */
function toDateInput(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "2026-12-31" → end of that local day, as ISO. Empty → no end date. */
function fromDateInput(value: string): string | null {
  return value ? new Date(`${value}T23:59:59`).toISOString() : null;
}

/** Back-office CRUD for the subscription plans shown on /tarifs and in the intake form. */
@Component({
  selector: 'app-admin-pricing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin-pricing.html',
  styleUrl: './admin-pricing.scss',
})
export class AdminPricingComponent implements OnInit {
  private readonly api = inject(PlanService);

  protected readonly eur = formatEuros;
  protected readonly scopes: { value: PromoScope; label: string }[] = [
    { value: 'both', label: 'Mensuel et annuel' },
    { value: 'mensuel', label: 'Mensuel uniquement' },
    { value: 'annuel', label: 'Annuel uniquement' },
  ];

  protected readonly plans = signal<Plan[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly seeding = signal(false);

  protected readonly editorOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly draft = signal<PlanDraft>(emptyPlanDraft());
  protected readonly featuresText = signal('');
  protected readonly saving = signal(false);
  protected readonly confirmDeleteId = signal<string | null>(null);

  protected readonly isEditing = computed(() => this.editingId() !== null);

  /** Working copy of the comparison table; saved whole with `saveTable()`. */
  protected readonly rows = signal<ComparisonRow[]>([]);
  protected readonly tableDirty = signal(false);
  protected readonly savingTable = signal(false);
  protected readonly tableMsg = signal('');
  /** Second click needed before the base table overwrites the current one. */
  protected readonly confirmReplace = signal(false);

  /** What the visitor would see with the draft as it stands. */
  protected readonly preview = computed(() => {
    const plan = { ...this.draft(), id: '', createdAt: '', updatedAt: '' } as Plan;
    const full = plan.monthlyPrice * 12;
    return {
      monthly: planPrice(plan, 'mensuel'),
      annual: planPrice(plan, 'annuel'),
      fullYear: full,
      saving: annualSaving(plan),
      monthsFree: plan.monthlyPrice > 0 ? (full - plan.annualPrice) / plan.monthlyPrice : 0,
    };
  });

  ngOnInit(): void {
    this.load();
    this.api.comparison().subscribe({
      next: (rows) => this.rows.set(rows),
      error: () => this.tableMsg.set('Impossible de charger le tableau comparatif.'),
    });
  }

  /* ---------- comparison table ---------- */

  private editRows(fn: (rows: ComparisonRow[]) => ComparisonRow[]): void {
    this.rows.update((rows) => fn(rows.map((r) => ({ ...r, values: { ...r.values } }))));
    this.tableDirty.set(true);
    this.tableMsg.set('');
  }

  protected addRow(): void {
    const last = this.rows().at(-1);
    this.editRows((rows) => [...rows, { group: last?.group ?? '', label: '', values: {} }]);
  }

  protected removeRow(i: number): void {
    this.editRows((rows) => rows.filter((_, n) => n !== i));
  }

  protected moveRow(i: number, dir: -1 | 1): void {
    const j = i + dir;
    if (j < 0 || j >= this.rows().length) return;
    this.editRows((rows) => {
      [rows[i], rows[j]] = [rows[j], rows[i]];
      return rows;
    });
  }

  protected setRow(i: number, field: 'group' | 'label', value: string): void {
    this.editRows((rows) => {
      rows[i][field] = value;
      return rows;
    });
  }

  protected setCell(i: number, planId: string, value: string): void {
    this.editRows((rows) => {
      rows[i].values[planId] = value;
      return rows;
    });
  }

  /** Fill the table from the proposal's grid, matching columns by plan slug. */
  protected importStarterTable(): void {
    this.confirmReplace.set(false);
    const idBySlug = new Map(this.plans().map((p) => [p.slug, p.id]));
    this.editRows(() =>
      STARTER_COMPARISON.map((r) => ({
        group: r.group,
        label: r.label,
        values: Object.fromEntries(
          Object.entries(r.values)
            .filter(([slug]) => idBySlug.has(slug))
            .map(([slug, v]) => [idBySlug.get(slug)!, v]),
        ),
      })),
    );
  }

  protected saveTable(): void {
    if (this.savingTable()) return;
    const rows = this.rows().filter((r) => r.label.trim());
    this.savingTable.set(true);
    this.tableMsg.set('');
    this.api.saveComparison(rows).subscribe({
      next: (saved) => {
        this.rows.set(saved);
        this.savingTable.set(false);
        this.tableDirty.set(false);
        this.tableMsg.set('Tableau enregistré.');
      },
      error: (err: HttpErrorResponse) => {
        this.savingTable.set(false);
        this.tableMsg.set(err.error?.error ?? 'Échec de l’enregistrement du tableau.');
      },
    });
  }

  protected load(): void {
    this.loading.set(true);
    this.api.listAll().subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Impossible de charger les formules.');
        this.loading.set(false);
      },
    });
  }

  /** Status of a plan's promo for the list: running, scheduled-out (expired) or off. */
  protected promoState(plan: Plan): 'on' | 'expired' | 'off' {
    if (!plan.promo?.active) return 'off';
    return promoRuns(plan, 'mensuel') || promoRuns(plan, 'annuel') ? 'on' : 'expired';
  }

  protected patch(part: Partial<PlanDraft>): void {
    this.draft.update((d) => ({ ...d, ...part }));
  }

  protected patchPromo(part: Partial<PlanPromo>): void {
    this.draft.update((d) => ({ ...d, promo: { ...d.promo, ...part } }));
  }

  protected promoEndInput(): string {
    return toDateInput(this.draft().promo.endsAt);
  }

  protected setPromoEnd(value: string): void {
    this.patchPromo({ endsAt: fromDateInput(value) });
  }

  /** Optional integer field: blank → null. */
  protected setPromoMonths(value: string): void {
    const n = parseInt(value, 10);
    this.patchPromo({ months: Number.isFinite(n) && n > 0 ? n : null });
  }

  /** Annual = 10 × monthly, i.e. "2 mois offerts". */
  protected annualFromMonthly(): void {
    this.patch({ annualPrice: Math.round(this.draft().monthlyPrice * 10 * 100) / 100 });
  }

  protected openNew(): void {
    this.draft.set({ ...emptyPlanDraft(), order: this.plans().length + 1 });
    this.featuresText.set('');
    this.editingId.set(null);
    this.error.set('');
    this.editorOpen.set(true);
  }

  protected openEdit(plan: Plan): void {
    this.draft.set(toPlanDraft(plan));
    this.featuresText.set(plan.features.join('\n'));
    this.editingId.set(plan.id);
    this.error.set('');
    this.editorOpen.set(true);
  }

  protected close(): void {
    this.editorOpen.set(false);
    this.confirmDeleteId.set(null);
  }

  protected save(): void {
    if (this.saving()) return;
    const d = this.draft();
    if (!d.name.trim()) {
      this.error.set('Le nom est obligatoire.');
      return;
    }
    if (!(d.monthlyPrice >= 0) || !(d.annualPrice >= 0)) {
      this.error.set('Les prix doivent être des nombres positifs.');
      return;
    }
    if (d.promo.active && !(d.promo.percent >= 1 && d.promo.percent <= 100)) {
      this.error.set('La remise doit être comprise entre 1 et 100 %.');
      return;
    }
    const payload: PlanDraft = {
      ...d,
      name: d.name.trim(),
      slug: d.slug.trim(),
      features: this.featuresText()
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
    };
    this.saving.set(true);
    this.error.set('');
    const id = this.editingId();
    const req = id ? this.api.update(id, payload) : this.api.create(payload);
    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.close();
        this.load(); // re-sort by order server-side
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.error.set(err.error?.error ?? 'Échec de l’enregistrement.');
      },
    });
  }

  /** One click to start from the grid of the subscription proposal. */
  protected seedStarterPlans(): void {
    if (this.seeding()) return;
    this.seeding.set(true);
    this.error.set('');
    concat(...STARTER_PLANS.map((p) => this.api.create(p)))
      .pipe(toArray())
      .subscribe({
        next: () => {
          this.seeding.set(false);
          this.load();
        },
        error: () => {
          this.seeding.set(false);
          this.error.set('Échec de l’import de la grille de base.');
          this.load();
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
        this.plans.update((list) => list.filter((p) => p.id !== id));
        this.confirmDeleteId.set(null);
        if (this.editingId() === id) this.close();
      },
      error: () => this.error.set('Échec de la suppression.'),
    });
  }
}
