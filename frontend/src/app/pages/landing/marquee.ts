import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Infinite scrolling band of target audiences; pauses on hover. */
@Component({
  selector: 'app-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="marquee">
      <div class="mq-track" aria-hidden="true">
        @for (word of words; track $index) {
          <span>{{ word }}</span>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .marquee {
        position: relative;
        z-index: 2;
        border-top: 1px solid var(--line2);
        border-bottom: 1px solid var(--line2);
        padding: 26px 0;
        overflow: hidden;
        -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
        mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
      }
      .mq-track {
        display: flex;
        gap: 0;
        width: max-content;
        animation: mq-scroll 30s linear infinite;
      }
      .mq-track:hover { animation-play-state: paused; }
      .mq-track span {
        font-family: var(--serif);
        font-size: clamp(22px, 2.6vw, 34px);
        font-weight: 500;
        color: #cabfae;
        padding: 0 28px;
        display: inline-flex;
        align-items: center;
        gap: 28px;
      }
      .mq-track span::after {
        content: "✦";
        color: var(--accent);
        font-size: 0.5em;
      }
      @keyframes mq-scroll {
        to { transform: translateX(-50%); }
      }
    `,
  ],
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
