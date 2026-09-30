import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { backofficeHostGuard } from './guards/backoffice-host.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'JUNO — Votre site, dessiné en quelques minutes',
    data: {
      description:
        'JUNO — agence web. Décrivez votre projet, on vous dessine une maquette, vous validez, on développe et on met en ligne. Clé en main.',
    },
    canActivate: [backofficeHostGuard],
    loadComponent: () =>
      import('./components/landing/landing').then((m) => m.LandingComponent),
  },
  {
    path: 'projet',
    title: 'JUNO — Décrivez votre projet',
    data: {
      description:
        'Décrivez votre projet en quelques questions : JUNO vous propose une maquette de votre site, puis un devis.',
    },
    loadComponent: () =>
      import('./components/intake/intake').then((m) => m.IntakeComponent),
  },
  {
    path: 'realisations',
    title: 'JUNO — Nos réalisations',
    data: {
      description:
        'Découvrez les réalisations de JUNO, agence web : les sites conçus et mis en ligne pour nos clients.',
    },
    canActivate: [backofficeHostGuard],
    loadComponent: () =>
      import('./components/portfolio/portfolio').then((m) => m.PortfolioComponent),
  },
  {
    path: 'mentions-legales',
    title: 'JUNO — Mentions légales',
    data: {
      doc: 'mentions',
      description:
        'Mentions légales du site JUNO : éditeur, hébergement, propriété intellectuelle, données personnelles et cookies.',
    },
    loadComponent: () =>
      import('./components/legal/legal').then((m) => m.LegalComponent),
  },
  {
    path: 'confidentialite',
    title: 'JUNO — Politique de confidentialité',
    data: {
      doc: 'confidentialite',
      description:
        'Politique de confidentialité de JUNO : données collectées, finalités, durée de conservation et exercice de vos droits.',
    },
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
        path: 'tickets',
        title: 'JUNO — Tickets',
        loadComponent: () =>
          import('./components/admin-tickets/admin-tickets').then(
            (m) => m.AdminTicketsComponent,
          ),
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
