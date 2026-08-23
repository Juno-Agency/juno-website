import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { backofficeHostGuard } from './guards/backoffice-host.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'JUNO — Votre site, dessiné en quelques minutes',
    canActivate: [backofficeHostGuard],
    loadComponent: () =>
      import('./components/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'projet',
    title: 'JUNO — Décrivez votre projet',
    loadComponent: () =>
      import('./components/intake/intake').then((m) => m.IntakeComponent),
  },
  {
    path: 'realisations',
    title: 'JUNO — Nos réalisations',
    canActivate: [backofficeHostGuard],
    loadComponent: () =>
      import('./components/portfolio/portfolio').then((m) => m.PortfolioComponent),
  },
  {
    path: 'mentions-legales',
    title: 'JUNO — Mentions légales',
    data: { doc: 'mentions' },
    loadComponent: () =>
      import('./components/legal/legal').then((m) => m.LegalComponent),
  },
  {
    path: 'confidentialite',
    title: 'JUNO — Politique de confidentialité',
    data: { doc: 'confidentialite' },
    loadComponent: () =>
      import('./components/legal/legal').then((m) => m.LegalComponent),
  },
  {
    path: 'admin/login',
    title: 'JUNO — Back-office',
    loadComponent: () =>
      import('./components/login/login').then((m) => m.AdminLoginComponent),
  },
  {
    path: 'admin',
    title: 'JUNO — Back-office',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./components/layout/layout').then((m) => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/dashboard/dashboard').then(
            (m) => m.AdminDashboardComponent,
          ),
      },
      {
        path: 'stats',
        title: 'JUNO — Statistiques',
        loadComponent: () =>
          import('./components/stats/stats').then((m) => m.AdminStatsComponent),
      },
      {
        path: 'portfolio',
        title: 'JUNO — Portfolio',
        loadComponent: () =>
          import('./components/admin-portfolio/admin-portfolio').then(
            (m) => m.AdminPortfolioComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
