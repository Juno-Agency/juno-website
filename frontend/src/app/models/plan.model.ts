export type BillingPeriod = 'mensuel' | 'annuel';
export type PromoScope = 'both' | BillingPeriod;

export interface PlanPromo {
  active: boolean;
  /** 1–100. */
  percent: number;
  /** Public wording, e.g. "Offre de lancement". */
  label: string;
  /** Discount only the first N months; null = as long as the promo runs. */
  months: number | null;
  /** ISO date of the last day the promo is shown; null = no end. */
  endsAt: string | null;
  appliesTo: PromoScope;
}

/** A subscription plan as returned by the API (euros, TVA non applicable). */
export interface Plan {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  monthlyPrice: number;
  /** Price of a full year. */
  annualPrice: number;
  features: string[];
  badge: string;
  featured: boolean;
  published: boolean;
  order: number;
  promo: PlanPromo;
  createdAt: string;
  updatedAt: string;
}

/** Editable subset for the back-office form (server fields excluded). */
export type PlanDraft = Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>;

/**
 * One line of the /tarifs comparison table. `values` maps a plan id to its
 * cell: "✓" (included), a short text ("48 h"), or "" (not included).
 */
export interface ComparisonRow {
  group: string;
  label: string;
  values: Record<string, string>;
}

/** How a comparison cell renders. */
export type CellKind = 'yes' | 'no' | 'soon' | 'text';

export function cellKind(value: string | undefined): CellKind {
  const v = (value ?? '').trim().toLowerCase();
  if (!v || v === '—' || v === '-' || v === 'non') return 'no';
  // Announced but not shipped yet: drawn as a "Bientôt" chip.
  if (v.startsWith('bientôt') || v.startsWith('bientot')) return 'soon';
  if (v === '✓' || v === 'x' || v === 'oui' || v === 'ok') return 'yes';
  return 'text';
}

/** Intake answers for the subscription step that aren't plan slugs. */
export const SUBSCRIPTION_DISCUSS = 'discuter';
export const SUBSCRIPTION_NONE = 'aucune';

export function emptyPromo(): PlanPromo {
  return { active: false, percent: 10, label: '', months: null, endsAt: null, appliesTo: 'both' };
}

export function emptyPlanDraft(): PlanDraft {
  return {
    name: '',
    slug: '',
    tagline: '',
    monthlyPrice: 0,
    annualPrice: 0,
    features: [],
    badge: '',
    featured: false,
    published: true,
    order: 0,
    promo: emptyPromo(),
  };
}

export function toPlanDraft(plan: Plan): PlanDraft {
  return {
    name: plan.name,
    slug: plan.slug,
    tagline: plan.tagline,
    monthlyPrice: plan.monthlyPrice,
    annualPrice: plan.annualPrice,
    features: [...plan.features],
    badge: plan.badge,
    featured: plan.featured,
    published: plan.published,
    order: plan.order,
    promo: { ...emptyPromo(), ...plan.promo },
  };
}

/**
 * The grid from the subscription proposal (October 2026), offered as a
 * one-click starting point when the back-office has no plan yet.
 */
export const STARTER_PLANS: PlanDraft[] = [
  {
    ...emptyPlanDraft(),
    name: 'Essentiel',
    slug: 'essentiel',
    tagline: 'L’hébergement et la maintenance : votre site reste en ligne, à jour et en sécurité.',
    monthlyPrice: 29,
    annualPrice: 290,
    features: [
      'Hébergement, certificat SSL et nom de domaine gérés',
      'Mises à jour de sécurité',
      'Sauvegardes hebdomadaires',
      'Surveillance 24h/24 avec alerte',
      'Rapport mensuel court par email',
      'Intervention sous 72 h',
    ],
    order: 1,
  },
  {
    ...emptyPlanDraft(),
    name: 'Croissance',
    slug: 'croissance',
    tagline: 'Hébergement + SEO : on fait progresser votre site sur Google, mois après mois.',
    monthlyPrice: 69,
    annualPrice: 690,
    features: [
      'Tout Essentiel',
      '1 h de modifications par mois',
      'Sauvegardes quotidiennes',
      'Un conseil de contenu par mois, on intègre et optimise vos textes',
      'SEO technique et suivi Google Search Console',
      'Mise à jour de votre fiche Google Business',
      'Rapport mensuel page par page',
      'Intervention sous 48 h',
    ],
    badge: 'Le plus choisi',
    featured: true,
    order: 2,
  },
  {
    ...emptyPlanDraft(),
    name: 'Performance',
    slug: 'performance',
    tagline: 'Hébergement + SEO + statistiques : on pilote votre visibilité avec vous, chiffres à l’appui.',
    monthlyPrice: 149,
    annualPrice: 1490,
    features: [
      'Tout Croissance',
      '3 h de modifications par mois',
      '1 page ou article rédigé et optimisé par mois',
      'Suivi de vos positions sur 10 mots-clés',
      'Rapport mensuel avec recommandations',
      'Point visio de 30 min chaque mois',
      'Espace client avec vos statistiques (bientôt)',
      'Intervention sous 24 h',
    ],
    order: 3,
  },
];

/**
 * Comparison table of the subscription proposal, keyed by plan slug. The
 * back-office maps slugs to plan ids when importing it.
 */
export const STARTER_COMPARISON: { group: string; label: string; values: Record<string, string> }[] = [
  { group: 'Hébergement et maintenance', label: 'Hébergement, SSL et nom de domaine', values: { essentiel: '✓', croissance: '✓', performance: '✓' } },
  { group: 'Hébergement et maintenance', label: 'Mises à jour de sécurité', values: { essentiel: '✓', croissance: '✓', performance: '✓' } },
  { group: 'Hébergement et maintenance', label: 'Sauvegardes', values: { essentiel: 'Hebdomadaires', croissance: 'Quotidiennes', performance: 'Quotidiennes' } },
  { group: 'Hébergement et maintenance', label: 'Surveillance 24h/24 avec alerte', values: { essentiel: '✓', croissance: '✓', performance: '✓' } },
  { group: 'Hébergement et maintenance', label: 'Modifications incluses', values: { essentiel: '', croissance: '1 h / mois', performance: '3 h / mois' } },
  { group: 'Hébergement et maintenance', label: 'Délai d’intervention', values: { essentiel: '72 h', croissance: '48 h', performance: '24 h' } },
  { group: 'Référencement (SEO)', label: 'SEO technique et Google Search Console', values: { essentiel: '', croissance: '✓', performance: '✓' } },
  { group: 'Référencement (SEO)', label: 'Suivi et optimisation de la vitesse', values: { essentiel: '', croissance: '✓', performance: '✓' } },
  { group: 'Référencement (SEO)', label: 'Conseil de contenu et intégration de vos textes', values: { essentiel: '', croissance: '1 par mois', performance: '1 par mois' } },
  { group: 'Référencement (SEO)', label: 'Page ou article rédigé par nos soins', values: { essentiel: '', croissance: '', performance: '1 par mois' } },
  { group: 'Référencement (SEO)', label: 'Fiche Google Business', values: { essentiel: '', croissance: 'Mise à jour', performance: 'Optimisée + suivi' } },
  { group: 'Référencement (SEO)', label: 'Suivi de positions', values: { essentiel: '', croissance: '', performance: '10 mots-clés' } },
  { group: 'Statistiques et suivi', label: 'Rapport par email', values: { essentiel: 'Mensuel, court', croissance: 'Mensuel, page par page', performance: 'Mensuel + recommandations' } },
  { group: 'Statistiques et suivi', label: 'Récap hebdomadaire par email', values: { essentiel: '', croissance: '', performance: 'Bientôt' } },
  { group: 'Statistiques et suivi', label: 'Espace client : vos statistiques en ligne', values: { essentiel: '', croissance: '', performance: 'Bientôt' } },
  { group: 'Statistiques et suivi', label: 'Point visio', values: { essentiel: '', croissance: '', performance: '30 min / mois' } },
];
