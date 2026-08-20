import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../shared/reveal.directive';

interface Step {
  n: string;
  title: string;
  text: string;
  fast?: string;
}

/** "La méthode" — 4 steps, connecting line draws + nodes pop on scroll-in. */
@Component({
  selector: 'app-methode',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  template: `
    <section class="section" id="methode">
      <div class="shead">
        <span class="eyebrow r" appReveal>La méthode</span>
        <h2 class="h2 r d1" appReveal>
          Quatre étapes. Vous gardez la main <em class="acc">à chaque fois</em>.
        </h2>
      </div>
      <div class="steps" appReveal>
        @for (s of steps; track s.n) {
          <div class="step">
            <span class="node">{{ s.n }}</span>
            <h3>{{ s.title }}</h3>
            <p>{{ s.text }}</p>
            @if (s.fast) {
              <span class="fast">{{ s.fast }}</span>
            }
          </div>
        }
      </div>
    </section>
  `,
  styleUrl: './methode.scss',
})
export class MethodeComponent {
  protected readonly steps: Step[] = [
    { n: '01', title: 'Vous décrivez', text: 'En quelques phrases, votre activité et ce que vous voulez. Pas de jargon.' },
    { n: '02', title: 'Juno vous dessine', text: 'Un premier rendu sur-mesure, prêt à regarder.', fast: 'En quelques minutes' },
    { n: '03', title: 'Vous validez', text: 'Vous ajustez, vous commentez. Rien n’est codé tant que ça ne vous plaît pas.' },
    { n: '04', title: 'On met en ligne', text: 'On développe, on héberge, on déploie. Clé en main.' },
  ];
}
