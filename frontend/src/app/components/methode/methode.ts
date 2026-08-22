import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { I18nService } from '../../i18n/i18n.service';

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
  templateUrl: './methode.html',
  styleUrl: './methode.scss',
})
export class MethodeComponent {
  protected readonly tr = inject(I18nService).tr;
  protected readonly h2Text =
    'Quatre étapes. Vous gardez la main <em class="acc">à chaque fois</em>.';
  protected readonly steps: Step[] = [
    { n: '01', title: 'Vous décrivez', text: 'En quelques phrases, votre activité et ce que vous voulez. Pas de jargon.' },
    { n: '02', title: 'Juno vous dessine', text: 'Un premier rendu sur-mesure, prêt à regarder.', fast: 'En quelques minutes' },
    { n: '03', title: 'Vous validez', text: 'Vous ajustez, vous commentez. Rien n’est codé tant que ça ne vous plaît pas.' },
    { n: '04', title: 'On met en ligne', text: 'On développe, on héberge, on déploie. Clé en main.' },
  ];
}
