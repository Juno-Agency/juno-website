import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../shared/reveal.directive';

/** Closing call-to-action: giant JUNO logotype + button + mini footer. */
@Component({
  selector: 'app-cta-final',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective],
  template: `
    <section class="cta" id="cta">
      <h2 class="big r" appReveal>JUN<span class="dot">O</span></h2>
      <p class="sub r d1" appReveal>Prêt à voir votre site avant même de le commander ?</p>
      <a routerLink="/projet" class="btn btn-primary btn-lg r d2" appReveal>
        <span class="lab">Décrivez votre projet</span> <span class="arr">→</span>
      </a>
      <div class="cta-foot">
        <span>© 2026 JUNO — Agence web</span>
        <a href="mailto:hello@juno.studio">hello&#64;juno.studio</a>
        <span>Mentions légales · Confidentialité</span>
      </div>
    </section>
  `,
  styleUrl: './cta-final.scss',
})
export class CtaFinalComponent {}
