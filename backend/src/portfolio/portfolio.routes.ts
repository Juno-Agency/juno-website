import { Router } from 'express';
import multer from 'multer';
import { isValidObjectId } from 'mongoose';
import { Portfolio } from '../models';
import { asyncHandler, validateBody } from '../middleware/validate';
import { notFound } from '../middleware/http-error';
import { requireAuth } from '../auth/auth.middleware';
import {
  ALLOWED_IMAGE_TYPES,
  deleteImage,
  storageEnabled,
  uploadImage,
} from '../storage/r2';
import {
  CreatePortfolioInput,
  CreatePortfolioSchema,
  UpdatePortfolioInput,
  UpdatePortfolioSchema,
} from './portfolio.schema';

export const portfolioRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB
  fileFilter: (_req, file, cb) => cb(null, ALLOWED_IMAGE_TYPES.includes(file.mimetype)),
});

function requireObjectId(id: string): void {
  if (!isValidObjectId(id)) throw notFound('Projet introuvable');
}

/* ---------------- Public ---------------- */

// Public grid: published projects, manual order then newest first.
portfolioRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await Portfolio.find({ published: true }).sort({ order: 1, createdAt: -1 });
    res.json(items);
  }),
);

/* ---------------- Back-office (JWT) ---------------- */

// Every project, including drafts.
portfolioRouter.get(
  '/admin',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const items = await Portfolio.find().sort({ order: 1, createdAt: -1 });
    res.json(items);
  }),
);

// Upload one image to R2, returns its public URL + storage key.
portfolioRouter.post(
  '/upload',
  requireAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    if (!storageEnabled) {
      res.status(503).json({ error: 'Stockage non configuré (R2).' });
      return;
    }
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'Image manquante ou format non supporté (JPG, PNG, WebP, AVIF, GIF).' });
      return;
    }
    const { url, key } = await uploadImage(file.buffer, file.mimetype);
    res.status(201).json({ url, key });
  }),
);

portfolioRouter.post(
  '/',
  requireAuth,
  validateBody(CreatePortfolioSchema),
  asyncHandler(async (req, res) => {
    const item = await Portfolio.create(req.body as CreatePortfolioInput);
    res.status(201).json(item);
  }),
);

portfolioRouter.patch(
  '/:id',
  requireAuth,
  validateBody(UpdatePortfolioSchema),
  asyncHandler(async (req, res) => {
    requireObjectId(req.params.id);
    const data = req.body as UpdatePortfolioInput;
    const before = await Portfolio.findById(req.params.id);
    if (!before) throw notFound('Projet introuvable');
    // If the image was replaced, clean up the old object from storage.
    if (data.imageKey && before.imageKey && data.imageKey !== before.imageKey) {
      await deleteImage(before.imageKey);
    }
    const item = await Portfolio.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    res.json(item);
  }),
);

portfolioRouter.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    requireObjectId(req.params.id);
    const deleted = await Portfolio.findByIdAndDelete(req.params.id);
    if (!deleted) throw notFound('Projet introuvable');
    if (deleted.imageKey) await deleteImage(deleted.imageKey);
    res.status(204).end();
  }),
);
