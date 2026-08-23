import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { GrainVignetteComponent } from '../grain-vignette/grain-vignette';
import { NavComponent } from '../nav/nav';
import { CtaFinalComponent } from '../cta-final/cta-final';
import { JunoMascot } from '../../shared/juno-mascot/juno-mascot';
import { I18nService } from '../../i18n/i18n.service';
import { PortfolioService } from '../../services/portfolio.service';
import { PortfolioItem } from '../../models/portfolio.model';

/** Public portfolio page — an animated editorial grid of realised projects. */
@Component({
  selector: 'app-portfolio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [GrainVignetteComponent, NavComponent, CtaFinalComponent, JunoMascot],
  templateUrl: './portfolio.html',
  styleUrl: './portfolio.scss',
})
export class PortfolioComponent implements OnInit {
  protected readonly tr = inject(I18nService).tr;
  private readonly api = inject(PortfolioService);

  protected readonly items = signal<PortfolioItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly failed = signal(false);

  ngOnInit(): void {
    this.api.list().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.failed.set(true);
        this.loading.set(false);
      },
    });
  }
}
