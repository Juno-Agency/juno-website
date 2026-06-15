import { Routes } from '@angular/router';
import { adminGuard } from './core/admin.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'JUNO — Votre site, dessiné en quelques minutes',
    loadComponent: () =>
      import('./pages/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'projet',
    title: 'JUNO — Décrivez votre projet',
    loadComponent: () =>
      import('./pages/intake/intake').then((m) => m.IntakeComponent),
  },
  {
    path: 'admin/login',
    title: 'JUNO — Back-office',
    loadComponent: () =>
      import('./pages/admin/login').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    title: 'JUNO — Back-office',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./pages/admin/layout').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./pages/admin/dashboard').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'stats',
        title: 'JUNO — Statistiques',
        loadComponent: () =>
          import('./pages/admin/stats').then((m) => m.AdminStatsComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
