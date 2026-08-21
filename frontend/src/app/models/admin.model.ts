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
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUOTED' | 'WON' | 'LOST';

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
