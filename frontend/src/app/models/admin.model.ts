/** A transactional email tied to a lead, with its latest delivery status. */
export interface LeadEmail {
  resendId?: string;
  kind?: 'internal' | 'client';
  to?: string;
  status?: DeliveryStatus;
  lastEventAt?: string | null;
}

/** Lead as returned by the API (GET /api/leads). */
export interface AdminLead {
  id: string;
  nom: string;
  email: string;
  tel: string | null;
  secteur: string;
  existant: string;
  type: string;
  pages: string[];
  styles: string[];
  refs: string;
  colors: string[];
  budget: string | null;
  echeance: string | null;
  message: string | null;
  status: LeadStatus;
  emails?: LeadEmail[];
  /** Ids of other leads from the same client, linked at submission. */
  relatedLeadIds?: string[];
  /** Subscription answer from the intake, snapshotted at submission. */
  abonnement?: LeadSubscription | null;
  createdAt: string;
  updatedAt: string;
}

export interface LeadSubscription {
  choix: 'formule' | 'discuter' | 'aucune';
  slug: string | null;
  formule: string | null;
  periode: 'mensuel' | 'annuel' | null;
  prix: number | null;
  promo: string | null;
}

/** "Croissance · annuel · 690 €/an · Offre de lancement −20 %" for the back-office. */
export function subscriptionLabel(sub: LeadSubscription | null | undefined): string {
  if (!sub) return '—';
  if (sub.choix === 'aucune') return 'Pas pour le moment';
  if (sub.choix === 'discuter') return 'À discuter ensemble';
  const unit = sub.periode === 'annuel' ? '/an' : '/mois';
  const price =
    sub.prix != null
      ? ` · ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 }).format(sub.prix)}${unit}`
      : '';
  return `${sub.formule ?? '—'} · ${sub.periode ?? ''}${price}${sub.promo ? ' · ' + sub.promo : ''}`;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'WON' | 'LOST';

export type DeliveryStatus =
  | 'queued'
  | 'sent'
  | 'delivered'
  | 'delivery_delayed'
  | 'bounced'
  | 'complained'
  | 'opened'
  | 'clicked';

/** Editable subset of a lead (everything except server-managed fields). */
export interface EditableLead {
  nom: string;
  email: string;
  tel: string | null;
  secteur: string;
  existant: string;
  type: string;
  pages: string[];
  styles: string[];
  refs: string;
  colors: string[];
  budget: string | null;
  echeance: string | null;
  message: string | null;
  status: LeadStatus;
}

export function toEditable(lead: AdminLead): EditableLead {
  return {
    nom: lead.nom,
    email: lead.email,
    tel: lead.tel,
    secteur: lead.secteur,
    existant: lead.existant,
    type: lead.type,
    pages: [...lead.pages],
    styles: [...lead.styles],
    refs: lead.refs,
    colors: [...lead.colors],
    budget: lead.budget,
    echeance: lead.echeance,
    message: lead.message,
    status: lead.status,
  };
}

export const LEAD_STATUSES: LeadStatus[] = [
  'NEW',
  'CONTACTED',
  'QUOTED',
  'WON',
  'LOST',
];

/** Human label + accent colour per status. */
export const STATUS_META: Record<
  LeadStatus,
  { label: string; color: string }
> = {
  NEW: { label: 'Nouveau', color: '#b9b5ad' },
  CONTACTED: { label: 'Contacté', color: '#8aa0b0' },
  QUOTED: { label: 'Devis envoyé', color: '#c0a15e' },
  WON: { label: 'Gagné', color: '#7d9b6f' },
  LOST: { label: 'Perdu', color: '#a3737b' },
};

/** Human label + accent colour per email delivery status (matches STATUS_META). */
export const DELIVERY_META: Record<DeliveryStatus, { label: string; color: string }> = {
  queued: { label: 'En file', color: '#6f6a63' },
  sent: { label: 'Envoyé', color: '#b9b5ad' },
  delivered: { label: 'Reçu', color: '#7d9b6f' },
  delivery_delayed: { label: 'Différé', color: '#c0a15e' },
  bounced: { label: 'Rejeté', color: '#a3737b' },
  complained: { label: 'Signalé spam', color: '#a3737b' },
  opened: { label: 'Ouvert', color: '#8aa0b0' },
  clicked: { label: 'Cliqué', color: '#8aa0b0' },
};

/** Human label per email kind. */
export const EMAIL_KIND_LABEL: Record<string, string> = {
  internal: 'Notification équipe',
  client: 'Récap client',
};

export const EXISTING_LABEL: Record<string, string> = {
  refaire: 'A déjà un site (à refaire)',
  aucun: 'Pas de site pour l’instant',
};

export interface CountPair {
  label: string;
  count: number;
}

/** Aggregated metrics from GET /api/leads/stats. */
export interface LeadStats {
  total: number;
  last30Days: number;
  byStatus: Record<string, number>;
  byType: CountPair[];
  bySecteur: CountPair[];
  byBudget: CountPair[];
  sentQuotes: number;
  signedQuotes: number;
  lostQuotes: number;
  conversionRate: number;
  signatureRate: number;
  timeline: { period: string; count: number }[];
}
