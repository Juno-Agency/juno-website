import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18nService } from '../../i18n/i18n.service';

/** Infinite scrolling band of target audiences; pauses on hover. */
@Component({
  selector: 'app-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './marquee.html',
  styleUrl: './marquee.scss',
})
export class MarqueeComponent {
  protected readonly tr = inject(I18nService).tr;
  // Duplicated list so the -50% translate loops seamlessly.
  private readonly base = [
    'Restaurants',
    'Artisans',
    'Boutiques',
    'Cabinets',
    'Indépendants',
    'Commerces',
  ];
  protected readonly words = [...this.base, ...this.base];
}
