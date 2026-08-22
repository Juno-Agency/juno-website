import { Schema, model } from 'mongoose';
import { LEAD_STATUS } from './leads/lead.schema';

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
  },
  { timestamps: true, versionKey: false, toJSON },
);
leadSchema.index({ createdAt: 1 });

export const Lead = model('Lead', leadSchema);
