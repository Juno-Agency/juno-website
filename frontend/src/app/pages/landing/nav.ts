import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

/** Fixed top navigation. Gains a blurred background + border once scrolled. */
@Component({
  selector: 'app-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav class="nav" [class.scrolled]="scrolled()">
      <a routerLink="/" fragment="top" class="logo">JUN<span class="dot">O</span></a>
      <a routerLink="/projet" class="btn btn-primary">
        <span class="lab">Décrivez votre projet</span> <span class="arr">→</span>
      </a>
    </nav>
  `,
  styles: [
    `
      .nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 40;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px var(--gutter);
        transition: padding 0.35s, background 0.35s, border-color 0.35s;
        border-bottom: 1px solid transparent;
      }
      .nav.scrolled {
        background: rgba(10, 26, 36, 0.72);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-bottom: 1px solid var(--line2);
        padding-top: 14px;
        padding-bottom: 14px;
      }
      .logo {
        font-family: var(--serif);
        font-weight: 600;
        font-size: 27px;
        letter-spacing: -0.02em;
      }
      .logo .dot {
        color: var(--accent);
      }
      .nav .btn {
        padding: 12px 20px;
        font-size: 14px;
      }
    `,
  ],
})
export class NavComponent {
  protected readonly scrolled = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 40);
  }
}
