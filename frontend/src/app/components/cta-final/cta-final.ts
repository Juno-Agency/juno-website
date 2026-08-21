import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../directives/reveal.directive';
import { JunoMascot } from '../../shared/juno-mascot/juno-mascot';

/** Closing call-to-action: giant JUNO logotype + button + mini footer. */
@Component({
  selector: 'app-cta-final',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective, JunoMascot],
  templateUrl: './cta-final.html',
  styleUrl: './cta-final.scss',
})
export class CtaFinalComponent {}
