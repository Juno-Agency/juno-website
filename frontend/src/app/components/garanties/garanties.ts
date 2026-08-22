import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RevealDirective } from '../../directives/reveal.directive';
import { I18nService, Lang } from '../../i18n/i18n.service';

interface Word {
  text: string;
  em?: boolean;
}
interface Guarantee {
  n: string;
  title: string;
  text: string;
}

/** The headline statement, per language (word-split for the stagger; one
    emphasised word gets the hollow-outline treatment). */
const STATEMENTS: Record<Lang, Word[]> = {
  fr: [
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
  ],
  en: [
    { text: 'You' },
    { text: 'approve' },
    { text: 'the' },
    { text: 'design' },
    { text: 'before', em: true },
    { text: 'we' },
    { text: 'build.' },
    { text: 'Never' },
    { text: 'a' },
    { text: 'bad' },
    { text: 'surprise.' },
  ],
  de: [
    { text: 'Sie' },
    { text: 'geben' },
    { text: 'das' },
    { text: 'Design' },
    { text: 'frei,' },
    { text: 'bevor', em: true },
    { text: 'wir' },
    { text: 'entwickeln.' },
    { text: 'Nie' },
    { text: 'böse' },
    { text: 'Überraschungen.' },
  ],
};

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
  private readonly i18n = inject(I18nService);
  protected readonly tr = this.i18n.tr;
  protected readonly words = computed<Word[]>(() => STATEMENTS[this.i18n.lang()]);

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
