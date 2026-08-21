import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Infinite scrolling band of target audiences; pauses on hover. */
@Component({
  selector: 'app-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './marquee.html',
  styleUrl: './marquee.scss',
})
export class MarqueeComponent {
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
