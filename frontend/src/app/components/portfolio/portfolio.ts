import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GrainVignetteComponent } from '../grain-vignette/grain-vignette';
import { NavComponent } from '../nav/nav';
import { CtaFinalComponent } from '../cta-final/cta-final';
import { JunoMascot } from '../../shared/juno-mascot/juno-mascot';
import { PortfolioCarouselComponent } from './carousel/carousel';
import { I18nService } from '../../i18n/i18n.service';
import { PortfolioService } from '../../services/portfolio.service';
import { PortfolioItem } from '../../models/portfolio.model';

/** Public portfolio page — a 3D carousel of realised projects. */
@Component({
  selector: 'app-portfolio',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    GrainVignetteComponent,
    NavComponent,
    CtaFinalComponent,
    JunoMascot,
    PortfolioCarouselComponent,
  ],
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
