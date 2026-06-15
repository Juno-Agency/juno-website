import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AdminAuthService } from '../../core/admin-auth.service';
import { GrainVignetteComponent } from '../../shared/fx/grain-vignette';

/** Back-office shell: top bar + tabbed navigation + routed content. */
@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, GrainVignetteComponent],
  template: `
    <app-grain-vignette />
    <header class="abar">
      <a routerLink="/" class="logo">JUN<span class="dot">O</span></a>
      <span class="tag">Back-office</span>
      <nav class="tabs">
        <a routerLink="/admin" routerLinkActive="on" [routerLinkActiveOptions]="{ exact: true }">
          Demandes
        </a>
        <a routerLink="/admin/stats" routerLinkActive="on">Statistiques</a>
      </nav>
      <div class="spacer"></div>
      <button class="ghost" (click)="logout()">Déconnexion</button>
    </header>

    <router-outlet />
  `,
  styles: [
    `
      :host {
        display: block;
        min-height: 100vh;
        min-height: 100dvh;
        position: relative;
      }
      .abar {
        position: sticky;
        top: 0;
        z-index: 20;
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 14px var(--gutter);
        border-bottom: 1px solid var(--line2);
        background: rgba(10, 26, 36, 0.82);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
      }
      .logo {
        font-family: var(--serif);
        font-size: 24px;
        letter-spacing: -0.02em;
      }
      .logo .dot {
        color: var(--accent);
      }
      .tag {
        font-family: var(--mono);
        font-size: 11px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: var(--muted);
        border: 1px solid var(--line);
        border-radius: 100px;
        padding: 4px 11px;
      }
      .tabs {
        display: flex;
        gap: 4px;
        margin-left: 10px;
      }
      .tabs a {
        font-size: 14px;
        font-weight: 500;
        color: var(--muted);
        padding: 8px 16px;
        border-radius: 100px;
        transition: color 0.2s, background 0.2s;
      }
      .tabs a:hover {
        color: var(--cream);
      }
      .tabs a.on {
        color: var(--on-accent);
        background: var(--accent);
      }
      .spacer {
        flex: 1;
      }
      .ghost {
        background: transparent;
        border: 1px solid var(--line);
        border-radius: 100px;
        color: var(--cream);
        font-family: var(--mono);
        font-size: 12px;
        padding: 8px 15px;
        transition: border-color 0.2s, color 0.2s;
      }
      .ghost:hover {
        border-color: var(--accent);
        color: var(--accent);
      }
      @media (max-width: 560px) {
        .abar {
          flex-wrap: wrap;
        }
        .tag {
          display: none;
        }
      }
    `,
  ],
})
export class AdminLayoutComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/admin/login']);
  }
}
