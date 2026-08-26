import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { routes } from './app.routes';

/**
 * JUNO-04 — chaque page publique est prérendue dans son propre dossier, mais
 * Render ne sert `/realisations` que si une règle pointe explicitement vers
 * `/realisations/index.html`. Oublier la règle en ajoutant une route, c'est
 * resservir la landing sur cette URL sans que rien ne le signale.
 */
describe('render.yaml — routes prérendues', () => {
  // Vitest tourne depuis frontend/ ; le blueprint vit à la racine du dépôt.
  const yaml = readFileSync(resolve(process.cwd(), '../render.yaml'), 'utf-8');
  const site = yaml.slice(yaml.indexOf('name: juno-site'), yaml.indexOf('name: juno-admin'));

  /** Routes publiques concrètes : ni back-office, ni joker, ni racine. */
  const publicPaths = routes
    .map((r) => r.path)
    .filter((p): p is string => !!p && p !== '**' && !p.startsWith('admin'));

  it('couvre toutes les routes publiques de l’application', () => {
    expect(publicPaths.length).toBeGreaterThan(0);
    for (const path of publicPaths) {
      expect(site, `route /${path} absente de render.yaml`).toContain(
        `source: /${path}, destination: /${path}/index.html`,
      );
    }
  });

  it('ne réintroduit pas de catch-all servant la landing', () => {
    expect(site).not.toContain('source: /*, destination: /index.html');
  });
});
