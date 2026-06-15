import { ChangeDetectionStrategy, Component } from '@angular/core';
import { GrainVignetteComponent } from '../../shared/fx/grain-vignette';
import { NavComponent } from './nav';
import { HeroChatComponent } from './hero-chat';
import { MarqueeComponent } from './marquee';
import { MethodeComponent } from './methode';
import { GarantiesComponent } from './garanties';
import { CtaFinalComponent } from './cta-final';

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
  template: `
    <app-grain-vignette />
    <app-nav />
    <app-hero-chat />
    <app-marquee />
    <app-methode />
    <app-garanties />
    <app-cta-final />
  `,
})
export class LandingComponent {}
