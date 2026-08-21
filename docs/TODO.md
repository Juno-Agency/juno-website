# TODO

## Mascotte JUNO — eye-tracking + corps blob (2026-08-21)

- [x] `shared/juno-mascot/blob.spec.ts` — tests des fonctions pures (rouge d'abord)
- [x] `shared/juno-mascot/blob.ts` — `blobRadius`, `blobPath`, `eyeOffset`
- [x] `shared/juno-mascot/pointer-tracker.ts` — 1 listener pointermove + 1 rAF partagés
- [x] `shared/juno-mascot/juno-mascot.ts` — composant standalone (blob, regard, blink, hover)
- [x] Remplacer le SVG dupliqué dans `nav.ts`, `cta-final.ts`, `hero-chat.html`, `intake.html`
- [x] Nettoyer `styles.scss` (`juno-float`, `juno-spin`, `path:first-of-type`)
- [x] Vérifier : tests verts + rendu des 4 instances sur :4200

### Ajout — réaction au clic (2026-08-21)

- [x] `shared/juno-mascot/spring.spec.ts` + `spring.ts` — ressort amorti sous-critique
- [x] Branchement `pointerdown` : écrasement, rebond, sur-amplitude du blob, flinch

### Review

- Composant `<juno-mascot>` : corps régénéré par frame (Catmull-Rom fermé, deux
  sinus non harmoniques), regard lissé, clignement toutes les 4-7 s, squash au
  survol, float du personnage entier avec ombre réactive.
- Un seul `pointermove` et un seul rAF pour les 5 instances ; `IntersectionObserver`,
  pause onglet caché, et sortie immédiate en `prefers-reduced-motion`.
- 13 tests Vitest sur les fonctions pures (`blobRadius`, `blobPath`, `eyeOffset`).
- Régression attrapée en vérification navigateur : perte de l'encapsulation des
  règles de taille → voir `docs/LESSONS.md`.
- Clic : ressort amorti (raideur 220, amortissement 14, sous-pas à 1/240 s pour ne
  pas diverger sur les frames longues). Mesuré en direct : 0,78 → 1,04 → repos en ~0,9 s.
- Préexistant, non traité : `ng build` échoue sur le budget de `intake.scss`
  (20,08 kB pour 20 kB) — déjà le cas sur `main`.
