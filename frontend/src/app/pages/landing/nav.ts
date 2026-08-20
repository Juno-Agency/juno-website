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
      <a routerLink="/" fragment="top" class="brand" aria-label="JUNO — accueil">
        <svg class="juno-mark" viewBox="0 0 64 64" aria-hidden="true">
          <ellipse cx="32" cy="58" rx="15" ry="3" fill="rgba(0,0,0,0.30)" />
          <path d="M32 4C46 3 59 12 60 27C61 39 57 49 46 56C37 61 26 61 17 55C7 48 3 37 5 26C7 13 19 5 32 4Z" fill="#fcfcfb" />
          <circle cx="24.5" cy="30" r="3.1" fill="#141414" />
          <circle cx="39.5" cy="30" r="3.1" fill="#141414" />
          <circle cx="25.4" cy="30.6" r="1.15" fill="#fcfcfb" />
          <circle cx="40.4" cy="30.6" r="1.15" fill="#fcfcfb" />
          <path d="M24 41 Q32 48 40 41" stroke="#141414" stroke-width="2.6" fill="none" stroke-linecap="round" />
        </svg>
        <span class="word">JUNO</span>
      </a>
      <div class="nav-right">
        <a routerLink="/" fragment="methode" class="nav-link">La méthode</a>
        <a routerLink="/" fragment="garanties" class="nav-link">Garanties</a>
        <a routerLink="/projet" class="btn btn-primary">
          <span class="lab">Décrivez votre projet</span> <span class="arr">→</span>
        </a>
      </div>
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
        padding: 18px var(--gutter);
        transition: padding 0.35s, background 0.35s, border-color 0.35s;
        border-bottom: 1px solid transparent;
      }
      .nav.scrolled {
        background: rgba(20, 20, 20, 0.72);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-bottom: 1px solid var(--line2);
        padding-top: 13px;
        padding-bottom: 13px;
      }
      .brand {
        display: inline-flex;
        align-items: center;
        gap: 11px;
      }
      .brand .juno-mark {
        width: 30px;
        height: 30px;
      }
      .brand .word {
        font-family: var(--serif);
        font-weight: 800;
        font-size: 22px;
        letter-spacing: 0.01em;
        text-transform: uppercase;
        line-height: 1;
      }
      .nav-right {
        display: inline-flex;
        align-items: center;
        gap: 24px;
      }
      .nav-link {
        font-family: var(--mono);
        font-size: 11.5px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        color: var(--muted);
        transition: color 0.2s;
      }
      .nav-link:hover {
        color: var(--cream);
      }
      .nav .btn {
        padding: 11px 20px;
        font-size: 13.5px;
      }
      @media (max-width: 720px) {
        .nav-link {
          display: none;
        }
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
