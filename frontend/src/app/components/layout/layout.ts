import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { GrainVignetteComponent } from '../grain-vignette/grain-vignette';

/** Back-office shell: top bar + tabbed navigation + routed content. */
@Component({
  selector: 'app-admin-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, GrainVignetteComponent],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class AdminLayoutComponent {
  private readonly auth = inject(AdminAuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/admin/login']);
  }
}
