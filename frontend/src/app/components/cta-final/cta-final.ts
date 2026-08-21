import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RevealDirective } from '../../directives/reveal.directive';

/** Closing call-to-action: giant JUNO logotype + button + mini footer. */
@Component({
  selector: 'app-cta-final',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RevealDirective],
  templateUrl: './cta-final.html',
  styleUrl: './cta-final.scss',
})
export class CtaFinalComponent {}
