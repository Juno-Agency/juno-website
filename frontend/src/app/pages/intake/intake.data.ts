import { LeadPayload } from '../../core/juno-lead.service';
import { Option, Question } from './intake.model';

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

export const SWATCHES: string[] = [
  '#8cc63f',
  '#0a1a24',
  '#2f6f5e',
  '#3b6ea5',
  '#b0843f',
  '#7a4ea0',
  '#c0455e',
];

const toOptions = (list: string[]): Option[] =>
  list.map((v) => ({ value: v, label: v }));

/** The intake flow — one question per screen. Budget + échéance added to the mockup's nine. */
export const QUESTIONS: Question[] = [
  {
    kind: 'text',
    key: 'nom',
    q: 'Pour commencer, vous êtes&nbsp;?',
    sub: 'Votre prénom ou le nom de votre activité.',
    ph: 'Camille Dubois',
    required: true,
  },
  {
    kind: 'email',
    key: 'email',
    q: 'Où peut-on vous <em>recontacter</em>&nbsp;?',
    sub: 'On revient vers vous sous 24 h ouvrées.',
    required: true,
  },
  {
    kind: 'single',
    key: 'secteur',
    q: 'Vous travaillez dans quel domaine&nbsp;?',
    opts: toOptions(SECTORS),
    required: true,
  },
  {
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
    kind: 'multi',
    key: 'pages',
    q: 'Quelles pages voulez-vous&nbsp;?',
    sub: 'Plusieurs choix possibles — au feeling.',
    opts: toOptions(PAGES),
  },
  {
    kind: 'multi',
    key: 'styles',
    q: 'L’ambiance que vous <em>imaginez</em>&nbsp;?',
    sub: 'Choisissez les mots qui vous parlent.',
    opts: toOptions(STYLES),
  },
  {
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
    kind: 'refs',
    q: 'Des références, des couleurs&nbsp;?',
    sub: 'Un site que vous aimez, vos couleurs si vous les avez. (optionnel)',
  },
  {
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
