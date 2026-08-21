import { LeadPayload } from '../services/juno-lead.service';
import { Option, Question, SectionDef } from './intake.model';

export const LETTERS = 'ABCDEFGHIJ';

export const SECTORS: string[] = [
  'Restauration',
  'Commerce / boutique',
  'Artisanat / BTP',
  'Santé / bien-être',
  'Services aux entreprises',
  'Beauté / coiffure',
  'Immobilier',
  'Autre',
];

export const PAGES: string[] = [
  'Accueil',
  'À propos',
  'Services',
  'Catalogue',
  'Réalisations',
  'Tarifs',
  'Contact',
  'Blog',
  'FAQ',
];

export const STYLES: string[] = [
  'Épuré',
  'Chaleureux',
  'Élégant',
  'Audacieux',
  'Moderne',
  'Artisanal',
  'Premium',
  'Minimaliste',
  'Coloré',
  'Naturel',
];

/**
 * Curated palettes offered at the colour step, keyed by the "ambiance" chosen
 * earlier. Refined styles never surface neon; "Coloré"/"Audacieux" do.
 */
export const STYLE_PALETTES: Record<string, string[]> = {
  'Épuré': ['#141414', '#4a4a47', '#8a8f98', '#b9b5ad', '#e8e6e1'],
  Minimaliste: ['#141414', '#33342f', '#9aa0a6', '#c9c4bb', '#e8e6e1'],
  Premium: ['#141414', '#1f2a37', '#3d4a3f', '#7a6a58', '#a98545'],
  'Élégant': ['#1b1620', '#4a2b3a', '#2f4a45', '#7a6a58', '#b0925e'],
  Moderne: ['#20242b', '#2f6f8f', '#3aa0a0', '#5a7d9a', '#c3cdd4'],
  Chaleureux: ['#8a3b26', '#b5623c', '#c9903f', '#e0c9a6', '#6b4a2f'],
  Artisanal: ['#2f2a25', '#6b4a2f', '#8a6d3b', '#4f5d3a', '#a9895f'],
  Naturel: ['#33402c', '#4f6b46', '#7d8a5c', '#a8b58f', '#d7cdb3'],
  Audacieux: ['#0f172a', '#c0392b', '#e07a1a', '#2b4cd6', '#6d3bd0'],
  'Coloré': ['#e84393', '#ff7a1a', '#f7c948', '#14b8a6', '#2d9bf0', '#7c3aed'],
};

/** Fallback palette when no ambiance was picked — refined neutrals, no neon. */
export const DEFAULT_SWATCHES: string[] = [
  '#141414',
  '#4a4a47',
  '#b9b5ad',
  '#e8e6e1',
  '#7a6a58',
  '#2f4a45',
];

/** Back-compat alias (used by the back-office legend). */
export const SWATCHES = DEFAULT_SWATCHES;

/** The three chapters of the funnel, shown in the left-rail stepper. */
export const SECTIONS: SectionDef[] = [
  { id: 1, label: 'Vous', hint: 'Qui vous êtes, comment vous joindre.' },
  { id: 2, label: 'Votre projet', hint: 'Ce que vous voulez, on le dessine au fur et à mesure.' },
  { id: 3, label: 'Détails & envoi', hint: 'Les derniers réglages, puis on s’en occupe.' },
];

/** Sector → hero line used by the live preview ("Juno dessine"). */
export const SECTOR_HERO: Record<string, string> = {
  Restauration: 'Une table qu’on réserve d’un clic.',
  'Commerce / boutique': 'Votre boutique, ouverte jour et nuit.',
  'Artisanat / BTP': 'Vos réalisations, mises en valeur.',
  'Santé / bien-être': 'Prendre rendez-vous, en toute simplicité.',
  'Services aux entreprises': 'Votre expertise, clairement présentée.',
  'Beauté / coiffure': 'Réservez votre moment, en ligne.',
  Immobilier: 'Vos biens, sublimés en vitrine.',
  Autre: 'Votre activité, en ligne et soignée.',
};

/** Site-type → the module the preview foregrounds. */
export const TYPE_MODULE: Record<string, string> = {
  'Site vitrine': 'Présentation',
  'Boutique en ligne': 'Boutique',
  'Application web': 'Espace client',
};

export const sectorHero = (secteur: string): string =>
  SECTOR_HERO[secteur] ?? 'Votre activité, en ligne et soignée.';

const toOptions = (list: string[]): Option[] =>
  list.map((v) => ({ value: v, label: v }));

/** The intake flow — one question per screen, grouped into 3 chapters. */
export const QUESTIONS: Question[] = [
  {
    section: 1,
    kind: 'text',
    key: 'nom',
    q: 'Pour commencer, vous êtes&nbsp;?',
    sub: 'Votre prénom ou le nom de votre activité.',
    ph: 'Camille Dubois',
    required: true,
  },
  {
    section: 1,
    kind: 'email',
    key: 'email',
    q: 'Où peut-on vous <em>recontacter</em>&nbsp;?',
    sub: 'On revient vers vous sous 24 h ouvrées.',
    required: true,
  },
  {
    section: 2,
    kind: 'single',
    key: 'secteur',
    q: 'Vous travaillez dans quel domaine&nbsp;?',
    opts: toOptions(SECTORS),
    required: true,
  },
  {
    section: 2,
    kind: 'single',
    key: 'existant',
    q: 'Vous avez déjà un site&nbsp;?',
    opts: [
      { value: 'refaire', label: 'Oui, mais il est à refaire' },
      { value: 'aucun', label: 'Non, aucun pour l’instant' },
    ],
    required: true,
  },
  {
    section: 2,
    kind: 'cards',
    key: 'type',
    q: 'Quel type de site vous faut-il&nbsp;?',
    opts: [
      { value: 'Site vitrine', label: 'Site vitrine', desc: 'Présenter votre activité' },
      { value: 'Boutique en ligne', label: 'Boutique en ligne', desc: 'Vendre vos produits' },
      { value: 'Application web', label: 'Application web', desc: 'Un outil sur-mesure' },
    ],
    required: true,
  },
  {
    section: 2,
    kind: 'multi',
    key: 'pages',
    q: 'Quelles pages voulez-vous&nbsp;?',
    sub: 'Plusieurs choix possibles — au feeling.',
    opts: toOptions(PAGES),
  },
  {
    section: 2,
    kind: 'multi',
    key: 'styles',
    q: 'L’ambiance que vous <em>imaginez</em>&nbsp;?',
    sub: 'Choisissez les mots qui vous parlent.',
    opts: toOptions(STYLES),
  },
  {
    section: 3,
    kind: 'single',
    key: 'budget',
    q: 'Quel <em>budget</em> imaginez-vous&nbsp;?',
    sub: 'Une fourchette suffit — on s’adapte. (optionnel)',
    opts: [
      { value: 'Moins de 1 000 €', label: 'Moins de 1 000 €' },
      { value: '1 000 – 3 000 €', label: '1 000 – 3 000 €' },
      { value: '3 000 – 6 000 €', label: '3 000 – 6 000 €' },
      { value: 'Plus de 6 000 €', label: 'Plus de 6 000 €' },
      { value: 'À définir ensemble', label: 'À définir ensemble' },
    ],
  },
  {
    section: 3,
    kind: 'single',
    key: 'echeance',
    q: 'Pour <em>quand</em>&nbsp;?',
    sub: 'Votre échéance idéale. (optionnel)',
    opts: [
      { value: 'Dès que possible', label: 'Dès que possible' },
      { value: 'Sous 1 mois', label: 'Sous 1 mois' },
      { value: '1 à 3 mois', label: '1 à 3 mois' },
      { value: 'Pas de date précise', label: 'Pas de date précise' },
    ],
  },
  {
    section: 3,
    kind: 'refs',
    q: 'Des références, des couleurs&nbsp;?',
    sub: 'Un site que vous aimez, vos couleurs si vous les avez. (optionnel)',
  },
  {
    section: 3,
    kind: 'final',
    key: 'message',
    q: 'Votre projet en <em>quelques mots</em>&nbsp;?',
    sub: 'Ce qui compte pour vous, vos objectifs. (optionnel)',
  },
];

/** A fresh, empty payload. */
export function emptyLead(): LeadPayload {
  return {
    nom: '',
    email: '',
    tel: '',
    secteur: '',
    existant: '',
    type: '',
    pages: [],
    styles: [],
    refs: '',
    colors: [],
    budget: '',
    echeance: '',
    message: '',
  };
}
