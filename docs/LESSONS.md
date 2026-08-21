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
