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
