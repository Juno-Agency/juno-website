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
    tagline: 'Votre site reste en ligne, à jour et en sécurité. Vous n’avez rien à gérer.',
    monthlyPrice: 29,
    annualPrice: 290,
    features: [
      'Hébergement, certificat SSL et nom de domaine gérés',
      'Mises à jour de sécurité',
      'Sauvegardes hebdomadaires',
      'Surveillance 24h/24 avec alerte',
      'Rapport mensuel par email',
      'Intervention sous 72 h',
    ],
    order: 1,
  },
  {
    ...emptyPlanDraft(),
    name: 'Croissance',
    slug: 'croissance',
    tagline: 'Votre site progresse chaque mois : plus rapide, mieux référencé, toujours à jour.',
    monthlyPrice: 69,
    annualPrice: 690,
    features: [
      'Tout Essentiel',
      '1 h de modifications par mois',
      'Sauvegardes quotidiennes',
      'Suivi et optimisation de la vitesse',
      'SEO technique et suivi Google Search Console',
      'Mise à jour de votre fiche Google Business',
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
    tagline: 'On travaille activement votre visibilité : contenu, positions sur Google, point mensuel.',
    monthlyPrice: 149,
    annualPrice: 1490,
    features: [
      'Tout Croissance',
      '3 h de modifications par mois',
      '1 page ou article optimisé SEO par mois',
      'Suivi de vos positions sur 10 mots-clés',
      'Point visio de 30 min chaque mois',
      'Intervention sous 24 h',
    ],
    order: 3,
  },
];
