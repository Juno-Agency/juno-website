# Leçons

## Angular — extraire un élément stylé par son parent dans un composant

**2026-08-21 — mascotte JUNO.** En sortant le `<svg>` dupliqué dans un composant
`<juno-mascot>`, toutes les règles de taille des parents (`.brand .juno-mark`,
`.cw-av`, `.cta .big .juno-mark`…) ont cessé de s'appliquer : le `<svg>` appartient
désormais au template de l'enfant, il porte donc son attribut `_ngcontent-*` et non
celui du parent. Résultat silencieux : logo à 69 px au lieu de 30, 1080 px au lieu
de 180. Le build passait, les tests aussi.

**Règle** — quand on extrait un élément dimensionné par son parent :
faire porter la taille par l'élément hôte (`.brand juno-mascot { … }`, l'hôte
appartenant bien au template du parent) et laisser l'enfant se contenter de
`:host { display: inline-block }` + `svg { width: 100%; height: 100% }`.
`display: contents` sur l'hôte ne sauve rien : le problème est l'encapsulation,
pas le layout.

**Corollaire** — une extraction de composant n'est pas vérifiée par un build vert.
Il faut comparer les dimensions calculées avant/après dans le navigateur.

## Audit — ouvrir les assets, pas seulement les lister

**2026-08-23 — favicon.** Lors de l'audit du site public, `frontend/public/`
a été inventorié (« ne contient qu'un favicon.ico ») sans que le fichier soit
ouvert. C'était le bouclier Angular par défaut, présent depuis le commit
initial et visible dans l'onglet de chaque visiteur. Le manque le plus voyant
du site est passé sous le radar d'un audit qui, par ailleurs, lisait le HTML
prérendu ligne à ligne.

**Règle** — un audit ne s'arrête pas au nom des fichiers. Tout asset binaire
livré au visiteur (favicon, OG image, logo, police) se regarde : `sips -s
format png … && Read`, ou un rendu navigateur. Un `ls` ne dit rien du contenu.

**Corollaire** — se méfier des fichiers datant du commit initial : ce sont les
valeurs par défaut du générateur, donc les candidats les plus probables à
l'oubli.

## Angular — un `<select>` ne se pilote pas par `[value]` sur le select

**2026-08-23 — onglet Tickets.** Les listes déroulantes de statut et de
priorité affichaient toutes la première option (« Basse »), quelle que soit la
valeur du ticket. `[value]` sur le `<select>` est appliqué avant que le `@for`
n'ait créé les `<option>` : le navigateur ne trouve alors aucune option
correspondante et retombe sur la première. Le build passait, les tests aussi,
et la classe conditionnelle (`.high`) était correcte — seul le texte affiché
mentait.

**Règle** — porter la sélection sur l'option (`<option [value]="x"
[selected]="x === valeurCourante">`), pas sur le select. Vaut pour tout
rendu où les options sont générées par un `@for`.

**Corollaire** — un écran de formulaire se relit dans le navigateur, valeurs
réelles en base à l'appui. Ici, deux tickets sur trois affichaient une priorité
fausse et rien dans la chaîne de build ne l'a signalé.

## Audit — une mesure Lighthouse ne vaut rien en un seul run

**2026-08-25 — audit du site.** Le premier passage desktop sur la landing donnait
`total-blocking-time` 7 120 ms, `bootup-time` 7,0 s et un score performance de 46,
avec un chunk JS accusé nommément et des « long tasks » de 2,7 s. Diagnostic tout
trouvé, cause racine plausible (la boucle `requestAnimationFrame` des mascottes),
ticket prêt à écrire. Les deux runs suivants, même URL, même preset : TBT 0 ms,
score 91. L'anomalie venait du poste de mesure, pas du site.

**Règle** — aucun chiffre Lighthouse ne devient un constat sans au moins deux
runs concordants. Ce qui se reproduit se rapporte (CLS 0,18 sur trois runs, LCP
14-17 s sur trois runs) ; ce qui bouge d'un facteur dix se jette. Le coût d'un
run supplémentaire est d'une minute, celui d'un faux diagnostic se compte en
heures de refonte inutile.

**Corollaire** — un rapport d'audit gagne à publier la dispersion (« 56 / 59 / 62 »)
plutôt qu'un chiffre unique : le lecteur voit lui-même ce qui est solide.

## CSS — un overlay `fixed` en `z-index` positif passe devant tout contenu non positionné

**2026-08-25 — back-office, onglets Tickets et Portfolio.** Le haut de ces deux
pages apparaissait voilé et grisé. Cause : `.grain` et `.vignette`
(`styles.scss`) sont `position: fixed; z-index: 1`, dont l'un en
`mix-blend-mode: overlay`. Un élément positionné à `z-index` positif est peint
au-dessus de tout élément non positionné, quel que soit l'ordre du DOM : les
deux composants se contentaient de `:host { display: block }` et se lisaient
donc *à travers* les overlays. Les quatre autres écrans qui montent la vignette
(dashboard, stats, login, portfolio public, legal, intake) posaient bien leur
`position: relative; z-index: 2` — deux l'avaient oublié.

**Règle** — tout composant monté sous un layout qui affiche `<app-grain-vignette />`
doit ouvrir son propre contexte d'empilement (`:host { position: relative;
z-index: 2 }`). Quand une règle doit être répétée dans chaque page, la liste des
pages qui l'appliquent est la première chose à comparer devant un bug d'affichage
localisé : l'écart entre celles qui marchent et celles qui ratent *est* le
diagnostic.

**Corollaire** — vérifié en changeant une seule variable dans le navigateur
(`host.style.zIndex = '2'`) avant de toucher au SCSS. Une capture avant/après
coûte deux minutes et remplace toute conjecture.

## Angular SSR — une route oubliée dans `app.routes.server.ts` est prérendue avec son guard

**2026-08-25 — `/admin/portfolio`.** En vérifiant le correctif précédent, l'accès
direct à cette URL renvoyait au formulaire de connexion malgré une session
valide. `app.routes.server.ts` déclarait `admin`, `admin/login`, `admin/stats` et
`admin/tickets` en `RenderMode.Client`, mais pas `admin/portfolio` : le catch-all
`**` la passait donc en `Prerender`. Au build, `adminGuard` s'exécute sans
`localStorage`, conclut « non authentifié » et fige une redirection —
`dist/frontend/browser/admin/portfolio/index.html` contenait littéralement
`<title>Redirecting</title>`. La navigation par les onglets fonctionnait, seul
un accès direct ou un F5 échouait, ce qui rendait le bug facile à ne pas voir.

**Règle** — toute route protégée par un guard doit être déclarée explicitement en
`RenderMode.Client`. Après un build, `find dist/frontend/browser -name index.html`
doit ne lister que des pages publiques : une route privée qui y apparaît est un
guard prérendu.

## Render — supprimer une règle du `render.yaml` ne la supprime pas du service

**2026-08-26 — JUNO-04, pages prérendues.** Chaque route publique est prérendue
dans son propre dossier, mais Render servait la landing sur les cinq URLs : la
règle `/* → /index.html` interceptait tout. Deux pièges se sont enchaînés.

Le premier est documenté mais contre-intuitif : *« Render does not apply
redirect or rewrite rules to a path if a resource exists at that path. »*
`/realisations` **n'est pas** une ressource — le fichier est
`/realisations/index.html`. Le catch-all s'appliquait donc, alors qu'un
`try_files $uri/` nginx aurait servi la bonne page. Il faut une règle explicite
par route prérendue.

Le second a coûté un aller-retour de déploiement. Retirer le catch-all du
`render.yaml` et pousser n'a rien changé en production, alors que le build, lui,
était bien déployé (`/404.html`, fichier nouveau, répondait 200). La spec des
blueprints le dit : *« Render **preserves** any existing routing rules that are
not included in the Blueprint file. »* Le `render.yaml` **fusionne** avec les
règles du service, il ne les remplace pas. La règle restait donc en place,
prioritaire, et Render *« applies the first encountered rule that matches »*.

**Règle** — le `render.yaml` ne peut qu'**ajouter ou modifier** des règles de
routage. En supprimer une exige une action manuelle dans le dashboard
(juno-site → Settings → Redirects/Rewrites). Après un push qui touche aux
`routes`, vérifier l'effet réel par `curl` et non par la couleur du déploiement.

**Corollaire — le bon signal de diagnostic.** Pour savoir si un correctif est
« pas encore déployé » ou « déployé mais sans effet », interroger un artefact
que seul le nouveau build produit (ici `/404.html`). Il répondait 200 : le build
était en ligne, donc le problème était ailleurs que dans le déploiement.

**Garde-fou** — `frontend/src/app/deploy-routes.spec.ts` compare les routes
publiques de `app.routes.ts` aux règles du `render.yaml` et échoue si une route
n'y a pas la sienne, ou si un catch-all vers la landing réapparaît. Un oubli de
règle ne se voit sur aucun écran : seul un test peut le rattraper.
