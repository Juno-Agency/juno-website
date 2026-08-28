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

/**
 * JUNO-06 — Render ne pose de lui-même que HSTS et X-Content-Type-Options. Les
 * autres en-têtes ne vivent que dans le blueprint : les perdre ne casse rien de
 * visible, c'est exactement pour ça qu'il faut un test.
 */
describe('render.yaml — en-têtes de sécurité', () => {
  const yaml = readFileSync(resolve(process.cwd(), '../render.yaml'), 'utf-8');
  const services = {
    'juno-site': yaml.slice(yaml.indexOf('name: juno-site'), yaml.indexOf('name: juno-admin')),
    'juno-admin': yaml.slice(yaml.indexOf('name: juno-admin')),
  };

  const REQUIRED = [
    'Content-Security-Policy',
    'X-Frame-Options',
    'Referrer-Policy',
    'Permissions-Policy',
    'Cross-Origin-Opener-Policy',
    // Render ne pose HSTS que sur *.onrender.com — sur agency-juno.com, il ne
    // vient que d'ici. Un scan Observatory du vrai domaine l'a mis au jour.
    'Strict-Transport-Security',
  ];

  for (const [name, block] of Object.entries(services)) {
    it(`${name} déclare tous les en-têtes attendus`, () => {
      for (const header of REQUIRED) {
        expect(block, `${header} manquant sur ${name}`).toContain(`name: ${header}`);
      }
    });

    it(`${name} interdit l’encadrement et les scripts tiers`, () => {
      expect(block).toContain("frame-ancestors 'none'");
      expect(block).toContain("object-src 'none'");
      expect(block).toContain("default-src 'self'");
      // 'unsafe-eval' n'a aucune raison d'apparaître : Angular n'en a pas besoin.
      expect(block).not.toContain('unsafe-eval');
    });
  }
});
