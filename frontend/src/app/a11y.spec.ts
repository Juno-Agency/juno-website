import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * JUNO-10 — Lighthouse (`landmark-one-main`) exige un `<main>` par page. Il se
 * perd sans bruit : la landing n'alignait que des composants, et la page de
 * connexion comme les pages légales n'avaient qu'un `<div>`.
 *
 * Le back-office connecté n'est pas listé : son layout n'a pas de `<main>`,
 * chaque page enfant (dashboard, stats, tickets, portfolio) porte le sien.
 */
describe('une page = un <main>', () => {
  // Vitest tourne depuis frontend/ ; les templates vivent sous src/app/components.
  const pages = [
    'landing/landing.html',
    'intake/intake.html',
    'portfolio/portfolio.html',
    'legal/legal.html',
    'login/login.html',
    'dashboard/dashboard.html',
    'stats/stats.html',
    'admin-tickets/admin-tickets.html',
    'admin-portfolio/admin-portfolio.html',
  ];

  for (const page of pages) {
    it(`${page} porte exactement un <main>`, () => {
      const html = readFileSync(resolve(process.cwd(), 'src/app/components', page), 'utf-8');
      expect(html.match(/<main[\s>]/g) ?? []).toHaveLength(1);
      expect(html.match(/<\/main>/g) ?? []).toHaveLength(1);
    });
  }
});

/**
 * JUNO-10 — carousel du portfolio. Un `aria-label` sur une cellule doit
 * contenir le texte visible tel que le concatène axe, c'est-à-dire sans
 * séparateur entre les `<span>` : aucun libellé correctement espacé n'y
 * satisfait (label-content-name-mismatch). Sans `aria-label`, le nom vient du
 * contenu — exactement ce que demande WCAG 2.5.3 — et l'image, qui répéterait
 * le titre affiché à côté, est décorative.
 */
describe('carousel du portfolio', () => {
  const html = readFileSync(
    resolve(process.cwd(), 'src/app/components/portfolio/carousel/carousel.html'),
    'utf-8',
  );

  it('ne pose pas d’aria-label sur les cellules', () => {
    expect(html).not.toContain('aria-label');
  });

  it('marque l’image décorative, son titre étant affiché à côté', () => {
    expect(html).toMatch(/<img [^>]*alt=""/);
  });

  it('titre les projets en h2, sous le h1 de la page', () => {
    expect(html).toContain('<h2 class="ttl">');
    expect(html).not.toMatch(/<h3/);
  });
});
