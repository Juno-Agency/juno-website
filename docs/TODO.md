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
- Clic : l'écrasement se maintient tant que le bouton est enfoncé, puis un ressort
  amorti (raideur 150, amortissement 7,5, sous-pas à 1/240 s pour ne pas diverger sur
  les frames longues) prend le relais. Mesuré en direct : maintien stable à 0,78 ;
  relâchement 0,78 → 1,08 → 0,97 → repos en ~2,2 s.
- `pointerup`/`pointercancel` sont écoutés sur la fenêtre : relâcher ailleurs ne laisse
  jamais la mascotte coincée à plat.
- Préexistant, non traité : `ng build` échoue sur le budget de `intake.scss`
  (20,08 kB pour 20 kB) — déjà le cas sur `main`.

## Back-office — onglet Tickets (2026-08-23)

Backlog interne JUNO, identifiants `JUNO-01`, `JUNO-02`… Liste filtrable par
statut, pas de lien avec les leads.

### Backend
- [x] Vitest en devDependency + script `test` (première infra de test du backend)
- [x] `tickets/ticket-key.spec.ts` — clé et séquence (rouge d'abord)
- [x] `tickets/ticket-key.ts` — `formatTicketKey`, `nextTicketSeq` (compteur atomique)
- [x] `models.ts` — schémas `Ticket` et `Counter`
- [x] `tickets/ticket.schema.ts` — Zod + OpenAPI
- [x] `tickets/tickets.routes.ts` — CRUD sous `requireAuth`, monté dans `app.ts`

### Frontend
- [x] `models/ticket.model.ts` + `services/ticket.service.ts`
- [x] `components/admin-tickets/` — table, filtres statut, création, édition, suppression
- [x] Route `admin/tickets` + onglet « Tickets » dans `layout.html`

### Vérification
- [x] Tests verts, build back + front
- [x] Essai navigateur : JUNO-01/02/03, filtre, changement de statut, suppression sans recyclage du numéro

### Review

- Backend calqué sur `portfolio/` : schéma Zod → OpenAPI, routes CRUD sous
  `requireAuth`, modèle Mongoose. Rien d'inédit à apprendre pour y revenir.
- Les identifiants viennent d'un compteur dédié (`counters`, `$inc` atomique
  sur un document unique), pas du nombre de tickets : deux créations
  simultanées ne peuvent pas se voir attribuer le même numéro, et un ticket
  supprimé ne libère pas le sien. Vérifié en direct : JUNO-02 supprimé, le
  ticket suivant est JUNO-04.
- Première infrastructure de test du backend (Vitest, 7 tests). Les specs sont
  exclues de `tsconfig` pour ne pas atterrir dans `dist/`.
- Statut et priorité se changent depuis la ligne, écriture optimiste avec
  retour à l'état précédent et message si l'API refuse.
- Régression attrapée en vérification navigateur : les `<select>` affichaient
  tous la première option — voir `docs/LESSONS.md`.
- Vérifié après rechargement complet : création (JUNO-05), persistance du
  statut, filtres et compteurs, suppression confirmée, zéro erreur console.
