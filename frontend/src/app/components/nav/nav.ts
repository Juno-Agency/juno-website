import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { JunoMascot } from '../../shared/juno-mascot/juno-mascot';
import { I18nService } from '../../i18n/i18n.service';
import { LangSwitcherComponent } from '../lang-switcher/lang-switcher';

/** Fixed top navigation. Gains a blurred background + border once scrolled. */
@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, JunoMascot, LangSwitcherComponent],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class NavComponent {
  protected readonly tr = inject(I18nService).tr;
  protected readonly scrolled = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }
}
