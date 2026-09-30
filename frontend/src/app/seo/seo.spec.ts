import { describe, expect, it } from 'vitest';

import { routes } from '../app.routes';
import { canonicalUrl } from './seo';

describe('canonicalUrl', () => {
  it('renvoie la racine avec son slash final', () => {
    expect(canonicalUrl('/')).toBe('https://agency-juno.com/');
  });

  it('reprend le chemin tel quel, sans slash final (comme le sitemap)', () => {
    expect(canonicalUrl('/projet')).toBe('https://agency-juno.com/projet');
  });

  it('écarte la query string et le fragment', () => {
    expect(canonicalUrl('/projet?utm_source=linkedin#etape-2')).toBe(
      'https://agency-juno.com/projet',
    );
    expect(canonicalUrl('/?ref=x')).toBe('https://agency-juno.com/');
  });
});

/**
 * Chaque page publique doit porter sa propre description : sans elle, le
 * service retombe sur rien et la page hérite de celle de index.html (celle de la
 * landing), donc d'un résumé faux pour les mentions légales.
 */
describe('routes publiques — description', () => {
  const publicRoutes = routes.filter(
    (r) => r.path !== undefined && r.path !== '**' && !r.path.startsWith('admin'),
  );

  it('couvre des routes', () => {
    expect(publicRoutes.length).toBeGreaterThan(0);
  });

  for (const route of publicRoutes) {
    it(`/${route.path} a une description de longueur raisonnable`, () => {
      const description = route.data?.['description'];
      expect(typeof description).toBe('string');
      // En dessous, Google la réécrit ; au-delà de 160, il la tronque.
      expect((description as string).length).toBeGreaterThanOrEqual(50);
      expect((description as string).length).toBeLessThanOrEqual(160);
    });
  }

  it('toutes les descriptions sont distinctes', () => {
    const all = publicRoutes.map((r) => r.data?.['description']);
    expect(new Set(all).size).toBe(all.length);
  });
});
