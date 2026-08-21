import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';

interface Word {
  text: string;
  em?: boolean;
}
interface Guarantee {
  n: string;
  title: string;
  text: string;
}

/**
 * The "promise" band: a large statement that staggers in word-by-word, plus
 * three qualitative guarantees (01/02/03). No numeric KPIs — by design.
 */
@Component({
  selector: 'app-garanties',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  templateUrl: './garanties.html',
  styleUrl: './garanties.scss',
})
export class GarantiesComponent {
  protected readonly words: Word[] = [
    { text: 'Vous' },
    { text: 'validez' },
    { text: 'le' },
    { text: 'design' },
    { text: 'avant', em: true },
    { text: 'qu’on' },
    { text: 'développe.' },
    { text: 'Jamais' },
    { text: 'de' },
    { text: 'mauvaise' },
    { text: 'surprise.' },
  ];

  protected readonly guarantees: Guarantee[] = [
    {
      n: '01',
      title: 'Vous validez d’abord',
      text: 'Rien n’est codé tant que la maquette ne vous plaît pas. Vous voyez exactement ce que vous aurez.',
    },
    {
      n: '02',
      title: 'Un prix clair, dès le départ',
      text: 'Vous savez ce que vous payez et ce que vous recevez. Pas de coûts cachés en cours de route.',
    },
    {
      n: '03',
      title: 'On s’occupe de tout',
      text: 'Design, développement, hébergement, mise en ligne — clé en main.',
    },
  ];
}
