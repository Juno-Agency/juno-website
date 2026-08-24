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

## Back-office — assignation des tickets (2026-08-23)

- [x] `ticket.schema.spec.ts` — assignation et désassignation (rouge d'abord)
- [x] `assignee` dans le schéma Zod, le modèle Mongoose et le filtre de liste
- [x] Colonne « assigné » éditable sur la ligne + champ dans l'éditeur
- [x] Filtre par personne, avec « Non assignés »
- [x] Vérification navigateur + état réel en base

### Review

- Liste fermée (`NOAH`, `JULIEN`) plutôt qu'un texte libre : à deux, une faute
  de frappe qui invente un troisième assigné coûte plus cher que la souplesse
  ne rapporte. Ajouter quelqu'un = une entrée dans `TICKET_ASSIGNEE`.
- `null` = personne, le ticket est au backlog commun. Le cas piégeux est la
  désassignation : `{ assignee: null }` doit effacer, `{}` ne doit rien
  toucher. Deux tests le figent, et c'est vérifié à l'API.
- Filtre par personne côté client, comme celui par statut, avec une entrée
  « Non assignés » — c'est la vue qui sert à piocher du travail.
- Anomalie constatée une fois pendant les essais (un statut revenu à « À
  faire ») et non reproduite depuis : trois vérifications enchaînées, à l'API
  puis dans l'interface, montrent le statut préservé par un changement
  d'assigné. Cause non établie ; à surveiller.

## Back-office — passage du tableau de tickets en kanban (2026-08-24)

- [x] `@angular/cdk@^21` (la version par défaut, 22, exige Angular 22)
- [x] `models/ticket-sort.spec.ts` + `ticket-sort.ts` — tri de colonne (rouge d'abord)
- [x] Colonnes À faire / En cours / Fait, cartes glissables, `onDrop` → statut
- [x] Sélecteurs conservés sur la carte (statut, priorité, assigné)
- [x] Filtre par personne remonté dans l'en-tête ; filtre par statut supprimé
- [x] Vérification navigateur + état réel en base

### Review

- Le glissé ne transporte que le statut : l'ordre dans une colonne est calculé
  (priorité puis numéro), donc rien à enregistrer et les deux comptes voient la
  même pile. `sortTickets` est pure et testée (5 tests).
- Le sélecteur de statut reste sur la carte : `cdkDrag` ne se pilote pas au
  clavier, sans lui l'écran serait inutilisable sans souris. Vérifié : il
  déplace bien la carte de colonne.
- `applyInline` est réutilisé tel quel — écriture optimiste, retour arrière et
  message si l'API refuse.
- Vérifié en direct : JUNO-03 glissé de « À faire » vers « Fait », `DONE`
  confirmé en base ; tri Haute avant Basse dans une colonne ; filtre par
  personne ; défilement horizontal des colonnes sous 900 px.
- Piège de vérification : `dragTo` de Playwright ne déclenche pas le CDK (pas
  de mouvements intermédiaires), il faut piloter la souris pas à pas. Un
  glissé « qui ne marche pas » en test automatisé n'est pas une preuve de bug.

## Backend — backlog de tickets sur une base séparée (2026-08-24)

- [x] `tickets-connection.spec.ts` + `tickets-connection.ts` (rouge d'abord)
- [x] `TICKETS_DATABASE_URL` dans la config, `Ticket`/`Counter` sur la connexion dédiée
- [x] Fermeture de la connexion dédiée dans `disconnectDb`
- [x] `.env.example` et README
- [x] Vérification avec deux bases réelles

### Review

- Répond à « les tickets sur la prod, le reste en local » sans proxy et sans
  toucher à l'authentification : une seule API, celle qui tourne en local, donc
  le JWT local reste valable pour tout. Rien à ouvrir publiquement.
- Variable absente = comportement d'avant. La production n'est pas concernée.
- La connexion est mémorisée : `Ticket` et `Counter` la partagent, sinon deux
  pools et un compteur potentiellement incohérent.
- Vérifié avec deux bases : le ticket créé atterrit dans `juno_backlog.tickets`
  avec son compteur, les anciens restent dans `juno.tickets`, et un lead créé
  dans la foulée va bien dans `juno.leads` et pas ailleurs.
- Le compteur vit avec les tickets : chaque base a sa séquence, donc aucune
  collision entre backlog local et backlog de production.
- Reste à faire côté Atlas : créer l'utilisateur `juno-tickets` avec un rôle
  limité aux collections `tickets` et `counters`, et fournir l'URI.
