import mongoose, { Schema, model } from 'mongoose';

import { config } from './config';
import { resolveTicketsConnection } from './tickets/tickets-connection';
import { LEAD_STATUS, LEAD_SUBSCRIPTION_CHOICES } from './leads/lead.schema';
import { BILLING_PERIODS, PROMO_SCOPES } from './plans/plan.schema';
import { TICKET_ASSIGNEE, TICKET_PRIORITY, TICKET_STATUS } from './tickets/ticket.schema';

/**
 * Shared toJSON transform: expose `id` (string) instead of `_id`/`__v`,
 * so API responses match the shape the front-office expects.
 */
const toJSON = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    delete ret['_id'];
  },
};

/**
 * One transactional email tied to a lead (team notification or client recap),
 * with its Resend id and latest delivery status fed by the Resend webhook.
 */
const leadEmailSchema = new Schema(
  {
    resendId: { type: String, index: true },
    kind: { type: String, enum: ['internal', 'client'] },
    to: { type: String },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'delivery_delayed', 'bounced', 'complained', 'opened', 'clicked'],
      default: 'queued',
    },
    lastEventAt: { type: Date, default: null },
  },
  { _id: false, timestamps: false },
);

const leadSubscriptionSchema = new Schema(
  {
    choix: { type: String, enum: LEAD_SUBSCRIPTION_CHOICES, required: true },
    slug: { type: String, default: null },
    formule: { type: String, default: null },
    periode: { type: String, enum: [...BILLING_PERIODS, null], default: null },
    prix: { type: Number, default: null },
    promo: { type: String, default: null },
  },
  { _id: false },
);

/* ---------------- Lead ---------------- */
const leadSchema = new Schema(
  {
    nom: { type: String, required: true },
    email: { type: String, required: true },
    tel: { type: String, default: null },
    secteur: { type: String, required: true },
    existant: { type: String, required: true },
    type: { type: String, required: true },
    pages: { type: [String], default: [] },
    styles: { type: [String], default: [] },
    refs: { type: String, default: '' },
    colors: { type: [String], default: [] },
    budget: { type: String, default: null },
    echeance: { type: String, default: null },
    message: { type: String, default: null },
    status: { type: String, enum: LEAD_STATUS, default: 'NEW', index: true },
    emails: { type: [leadEmailSchema], default: [] },
    // Other leads from the same client, linked when they choose "combine".
    relatedLeadIds: { type: [String], default: [] },
    // Subscription picked in the intake form, snapshotted at submission so a
    // later price change or a deleted plan never rewrites what the client saw.
    abonnement: { type: leadSubscriptionSchema, default: null },
  },
  { timestamps: true, versionKey: false, toJSON },
);
leadSchema.index({ createdAt: 1 });
// Retention promised in the privacy policy: leads are purged 3 years after the
// last contact (`updatedAt`). Won clients are kept — contractual/accounting
// documents must outlive that window, and they are real customers.
const THREE_YEARS_S = 3 * 365 * 24 * 60 * 60;
leadSchema.index(
  { updatedAt: 1 },
  {
    expireAfterSeconds: THREE_YEARS_S,
    partialFilterExpression: { status: { $in: ['NEW', 'CONTACTED', 'QUOTED', 'LOST'] } },
  },
);

export const Lead = model('Lead', leadSchema);

/* ---------------- Portfolio ---------------- */
const portfolioSchema = new Schema(
  {
    title: { type: String, required: true },
    client: { type: String, default: '' },
    category: { type: String, default: '' },
    tags: { type: [String], default: [] },
    description: { type: String, default: '' },
    // Public image URL (served from the CDN) + storage key (for deletion).
    imageUrl: { type: String, default: '' },
    imageKey: { type: String, default: '' },
    url: { type: String, default: '' },
    year: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true, index: true },
    // Manual sort order for the public grid (lower = first).
    order: { type: Number, default: 0, index: true },
  },
  { timestamps: true, versionKey: false, toJSON },
);
portfolioSchema.index({ order: 1, createdAt: -1 });

export const Portfolio = model('Portfolio', portfolioSchema);

/* ---------------- Plans (grille tarifaire) ---------------- */
const planPromoSchema = new Schema(
  {
    active: { type: Boolean, default: false },
    percent: { type: Number, default: 10 },
    label: { type: String, default: '' },
    months: { type: Number, default: null },
    endsAt: { type: Date, default: null },
    appliesTo: { type: String, enum: PROMO_SCOPES, default: 'both' },
  },
  { _id: false },
);

const planSchema = new Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    tagline: { type: String, default: '' },
    // Euros, TVA non applicable. The annual price is the full year.
    monthlyPrice: { type: Number, required: true },
    annualPrice: { type: Number, required: true },
    features: { type: [String], default: [] },
    badge: { type: String, default: '' },
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true, index: true },
    order: { type: Number, default: 0 },
    promo: { type: planPromoSchema, default: () => ({}) },
  },
  { timestamps: true, versionKey: false, toJSON },
);
planSchema.index({ order: 1, monthlyPrice: 1 });

export const Plan = model('Plan', planSchema);

/* ---------------- Tickets (back-office) ---------------- */

/**
 * Compteurs de séquence. Un document par compteur, incrémenté atomiquement —
 * voir tickets/ticket-key.ts.
 */
const counterSchema = new Schema(
  {
    _id: { type: String },
    value: { type: Number, default: 0 },
  },
  { versionKey: false },
);

/**
 * Tickets et compteur vivent sur `TICKETS_DATABASE_URL` quand elle est
 * renseignée, sur la base de l'application sinon. Voir
 * tickets/tickets-connection.ts pour le pourquoi.
 */
const ticketsConnection = resolveTicketsConnection(
  mongoose.connection,
  config.ticketsDatabaseUrl,
);

export const Counter = ticketsConnection.model('Counter', counterSchema);

const ticketSchema = new Schema(
  {
    // Identifiant lisible (JUNO-01). Unique : deux tickets ne peuvent pas le
    // partager, même si le compteur venait à être remis à zéro par erreur.
    key: { type: String, required: true, unique: true },
    seq: { type: Number, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    status: { type: String, enum: TICKET_STATUS, default: 'TODO', index: true },
    priority: { type: String, enum: TICKET_PRIORITY, default: 'MEDIUM' },
    // null = personne ne l'a pris ; le ticket reste au backlog commun.
    assignee: { type: String, enum: [...TICKET_ASSIGNEE, null], default: null, index: true },
  },
  { timestamps: true, versionKey: false, toJSON },
);
// La liste s'affiche du plus récent au plus ancien, filtrée par statut.
ticketSchema.index({ status: 1, seq: -1 });

export const Ticket = ticketsConnection.model('Ticket', ticketSchema);
