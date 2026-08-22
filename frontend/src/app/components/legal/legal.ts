import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GrainVignetteComponent } from '../grain-vignette/grain-vignette';
import { LEGAL_DOCS, LegalDoc } from '../../models/legal.data';
import { JunoMascot } from '../../shared/juno-mascot/juno-mascot';
import { I18nService } from '../../i18n/i18n.service';
import { LangSwitcherComponent } from '../lang-switcher/lang-switcher';

/** Renders a static legal document chosen by the route's `data.doc`. */
@Component({
  selector: 'app-legal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, GrainVignetteComponent, JunoMascot, LangSwitcherComponent],
  templateUrl: './legal.html',
  styleUrl: './legal.scss',
})
export class LegalComponent {
  private readonly route = inject(ActivatedRoute);
  protected readonly tr = inject(I18nService).tr;

  protected readonly doc: LegalDoc =
    LEGAL_DOCS[this.route.snapshot.data['doc'] as string] ?? LEGAL_DOCS['mentions'];
}
