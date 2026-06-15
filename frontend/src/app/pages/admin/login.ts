import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminAuthService } from '../../core/admin-auth.service';
import { GrainVignetteComponent } from '../../shared/fx/grain-vignette';

@Component({
  selector: 'app-admin-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, RouterLink, GrainVignetteComponent],
  template: `
    <app-grain-vignette />
    <div class="glow" aria-hidden="true"></div>

    <div class="wrap">
      <form class="card" (ngSubmit)="submit()">
        <a routerLink="/" class="logo">JUN<span class="dot">O</span></a>
        <p class="eyebrow">Back-office</p>
        <h1>Connexion</h1>

        <label>
          <span>Email</span>
          <input
            type="email"
            name="email"
            autocomplete="username"
            [(ngModel)]="email"
            placeholder="admin@juno.studio"
            required
          />
        </label>
        <label>
          <span>Mot de passe</span>
          <input
            type="password"
            name="password"
            autocomplete="current-password"
            [(ngModel)]="password"
            placeholder="••••••••"
            required
          />
        </label>

        @if (error()) {
          <p class="err">{{ error() }}</p>
        }

        <button class="go" type="submit" [disabled]="loading()">
          <span>{{ loading() ? 'Connexion…' : 'Se connecter' }}</span>
          <span class="arr">→</span>
        </button>

        <a routerLink="/" class="back">← Retour au site</a>
      </form>
    </div>
  `,
  styleUrl: './login.scss',
})
export class AdminLoginComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly error = signal('');
  protected readonly loading = signal(false);

  protected submit(): void {
    if (this.loading()) return;
    const email = this.email().trim();
    const password = this.password();
    if (!email || !password) {
      this.error.set('Renseignez votre email et votre mot de passe.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.auth.login(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        void this.router.navigate(['/admin']);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Identifiants invalides.');
      },
    });
  }
}
