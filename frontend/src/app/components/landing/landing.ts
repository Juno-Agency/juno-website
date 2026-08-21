import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GrainVignetteComponent } from '../grain-vignette/grain-vignette';
import { NavComponent } from '../nav/nav';
import { HeroChatComponent } from '../hero-chat/hero-chat';
import { MarqueeComponent } from '../marquee/marquee';
import { MethodeComponent } from '../methode/methode';
import { GarantiesComponent } from '../garanties/garanties';
import { CtaFinalComponent } from '../cta-final/cta-final';

/** One-page landing — assembles every section in order. */
@Component({
  selector: 'app-landing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    GrainVignetteComponent,
    NavComponent,
    HeroChatComponent,
    MarqueeComponent,
    MethodeComponent,
    GarantiesComponent,
    CtaFinalComponent,
  ],
  templateUrl: './landing.html',
})
export class LandingComponent {}
