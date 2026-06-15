import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Fixed full-viewport film grain + vignette overlays.
 * Reused on the landing and intake pages. Styles are global (styles.scss)
 * so the overlays sit above page backgrounds but below content.
 */
@Component({
  selector: 'app-grain-vignette',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="grain" aria-hidden="true"></div>
    <div class="vignette" aria-hidden="true"></div>
  `,
})
export class GrainVignetteComponent {}
