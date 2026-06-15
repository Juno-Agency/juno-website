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
  CountPair,
  LEAD_STATUSES,
  LeadStats,
  STATUS_META,
} from '../../core/admin.model';

@Component({
  selector: 'app-admin-stats',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './stats.html',
  styleUrl: './stats.scss',
})
export class AdminStatsComponent implements OnInit {
  private readonly admin = inject(AdminService);

  protected readonly statuses = LEAD_STATUSES;
  protected readonly statusMeta = STATUS_META;

  protected readonly stats = signal<LeadStats | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');

  protected readonly timelineMax = computed(() => {
    const t = this.stats()?.timeline ?? [];
    return Math.max(1, ...t.map((p) => p.count));
  });

  protected readonly statusRows = computed(() => {
    const s = this.stats();
    if (!s) return [];
    const max = Math.max(1, ...this.statuses.map((st) => s.byStatus[st] ?? 0));
    return this.statuses.map((st) => ({
      status: st,
      label: this.statusMeta[st].label,
      color: this.statusMeta[st].color,
      count: s.byStatus[st] ?? 0,
      pct: ((s.byStatus[st] ?? 0) / max) * 100,
    }));
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set('');
    this.admin.getStats().subscribe({
      next: (s) => {
        this.stats.set(s);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Impossible de charger les statistiques.');
      },
    });
  }

  /** Bar width for a count within a list, as a percentage of its max. */
  protected barPct(list: CountPair[], count: number): number {
    const max = Math.max(1, ...list.map((p) => p.count));
    return (count / max) * 100;
  }

  protected pct(fraction: number): string {
    return `${Math.round(fraction * 100)} %`;
  }
}
