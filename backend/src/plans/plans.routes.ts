import { Router } from 'express';
import { isValidObjectId } from 'mongoose';
import { Plan, PlanComparison } from '../models';
import { asyncHandler, validateBody } from '../middleware/validate';
import { badRequest, notFound } from '../middleware/http-error';
import { requireAuth } from '../auth/auth.middleware';
import { SUBSCRIPTION_DISCUSS, SUBSCRIPTION_NONE } from '../leads/lead.schema';
import {
  ComparisonTableInput,
  ComparisonTableSchema,
  CreatePlanInput,
  CreatePlanSchema,
  UpdatePlanInput,
  UpdatePlanSchema,
  slugify,
} from './plan.schema';

export const plansRouter = Router();

const COMPARISON_KEY = 'main';

/** Slugs the intake form already uses for its non-plan answers. */
const RESERVED_SLUGS = [SUBSCRIPTION_DISCUSS, SUBSCRIPTION_NONE];

function requireObjectId(id: string): void {
  if (!isValidObjectId(id)) throw notFound('Formule introuvable');
}

/** Rejects a reserved or already-taken slug with a readable 400. */
async function assertSlugFree(slug: string, exceptId?: string): Promise<void> {
  if (!slug) throw badRequest('Le nom doit contenir au moins une lettre ou un chiffre');
  if (RESERVED_SLUGS.includes(slug)) throw badRequest(`L’identifiant « ${slug} » est réservé`);
  const taken = await Plan.exists({ slug, ...(exceptId ? { _id: { $ne: exceptId } } : {}) });
  if (taken) throw badRequest(`L’identifiant « ${slug} » est déjà utilisé par une autre formule`);
}

/* ---------------- Public ---------------- */

// Pricing page + intake form: published plans, manual order then cheapest first.
plansRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const plans = await Plan.find({ published: true }).sort({ order: 1, monthlyPrice: 1 });
    res.json(plans);
  }),
);

// Comparison table under the plan cards. Rows only — the page keeps the
// columns of the plans it shows.
plansRouter.get(
  '/comparison',
  asyncHandler(async (_req, res) => {
    const doc = await PlanComparison.findOne({ key: COMPARISON_KEY }).lean();
    res.json(doc?.rows ?? []);
  }),
);

/* ---------------- Back-office (JWT) ---------------- */

// Replace the whole comparison table (the editor always saves it whole).
plansRouter.put(
  '/comparison',
  requireAuth,
  validateBody(ComparisonTableSchema),
  asyncHandler(async (req, res) => {
    const rows = req.body as ComparisonTableInput;
    const doc = await PlanComparison.findOneAndUpdate(
      { key: COMPARISON_KEY },
      { rows },
      { upsert: true, new: true, runValidators: true },
    ).lean();
    res.json(doc?.rows ?? []);
  }),
);

plansRouter.get(
  '/admin',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const plans = await Plan.find().sort({ order: 1, monthlyPrice: 1 });
    res.json(plans);
  }),
);

plansRouter.post(
  '/',
  requireAuth,
  validateBody(CreatePlanSchema),
  asyncHandler(async (req, res) => {
    const data = req.body as CreatePlanInput;
    const slug = data.slug || slugify(data.name);
    await assertSlugFree(slug);
    const plan = await Plan.create({ ...data, slug });
    res.status(201).json(plan);
  }),
);

plansRouter.patch(
  '/:id',
  requireAuth,
  validateBody(UpdatePlanSchema),
  asyncHandler(async (req, res) => {
    requireObjectId(req.params.id);
    const data = req.body as UpdatePlanInput;
    if (data.slug) await assertSlugFree(data.slug, req.params.id);
    const plan = await Plan.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!plan) throw notFound('Formule introuvable');
    res.json(plan);
  }),
);

plansRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    requireObjectId(req.params.id);
    const deleted = await Plan.findByIdAndDelete(req.params.id);
    if (!deleted) throw notFound('Formule introuvable');
    res.status(204).end();
  }),
);
