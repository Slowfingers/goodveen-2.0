import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';

export const workshopRouter = Router();

// ===== PUBLIC ROUTES =====

// Get all active tabs with their content
workshopRouter.get('/tabs', async (_req, res) => {
  const tabs = await prisma.workshopTab.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: {
      portfolioImages: {
        orderBy: { sortOrder: 'asc' },
      },
      contentBlocks: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
  res.json(tabs);
});

// Get single tab by slug
workshopRouter.get('/tabs/:slug', async (req, res) => {
  const tab = await prisma.workshopTab.findUnique({
    where: { slug: req.params.slug },
    include: {
      portfolioImages: {
        orderBy: { sortOrder: 'asc' },
      },
      contentBlocks: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
  if (!tab) return res.status(404).json({ error: 'Tab not found' });
  res.json(tab);
});

// ===== ADMIN ROUTES =====

// List all tabs (including inactive)
workshopRouter.get('/admin/tabs', requireAuth, async (_req, res) => {
  const tabs = await prisma.workshopTab.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      portfolioImages: {
        orderBy: { sortOrder: 'asc' },
      },
      contentBlocks: {
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
  res.json(tabs);
});

// Create tab
const createTabSchema = z.object({
  slug: z.string().min(1).max(100),
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

workshopRouter.post('/admin/tabs', requireAuth, async (req, res) => {
  const parsed = createTabSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const tab = await prisma.workshopTab.create({
    data: parsed.data,
  });
  res.status(201).json(tab);
});

// Update tab
const updateTabSchema = z.object({
  slug: z.string().min(1).max(100).optional(),
  title: z.string().min(1).max(200).optional(),
  description: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

workshopRouter.patch('/admin/tabs/:id', requireAuth, async (req, res) => {
  const parsed = updateTabSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const tab = await prisma.workshopTab.update({
    where: { id: req.params.id as string },
    data: parsed.data,
  });
  res.json(tab);
});

// Delete tab
workshopRouter.delete('/admin/tabs/:id', requireAuth, async (req, res) => {
  await prisma.workshopTab.delete({
    where: { id: req.params.id as string },
  });
  res.json({ ok: true });
});

// ===== PORTFOLIO IMAGES =====

// Add portfolio image
const addImageSchema = z.object({
  tabId: z.string(),
  url: z.string().url(),
  caption: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

workshopRouter.post('/admin/portfolio-images', requireAuth, async (req, res) => {
  const parsed = addImageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const image = await prisma.workshopPortfolioImage.create({
    data: parsed.data,
  });
  res.status(201).json(image);
});

// Update portfolio image
const updateImageSchema = z.object({
  url: z.string().url().optional(),
  caption: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

workshopRouter.patch('/admin/portfolio-images/:id', requireAuth, async (req, res) => {
  const parsed = updateImageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const image = await prisma.workshopPortfolioImage.update({
    where: { id: req.params.id as string },
    data: parsed.data,
  });
  res.json(image);
});

// Delete portfolio image
workshopRouter.delete('/admin/portfolio-images/:id', requireAuth, async (req, res) => {
  await prisma.workshopPortfolioImage.delete({
    where: { id: req.params.id as string },
  });
  res.json({ ok: true });
});

// ===== CONTENT BLOCKS =====

// Add content block
const addBlockSchema = z.object({
  tabId: z.string(),
  title: z.string().optional(),
  content: z.string().min(1),
  sortOrder: z.number().int().default(0),
});

workshopRouter.post('/admin/content-blocks', requireAuth, async (req, res) => {
  const parsed = addBlockSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const block = await prisma.workshopContentBlock.create({
    data: {
      tabId: parsed.data.tabId,
      content: parsed.data.content,
      title: parsed.data.title || null,
      sortOrder: parsed.data.sortOrder,
    },
  });
  res.status(201).json(block);
});

// Update content block
const updateBlockSchema = z.object({
  title: z.string().nullable().optional(),
  content: z.string().min(1).optional(),
  sortOrder: z.number().int().optional(),
});

workshopRouter.patch('/admin/content-blocks/:id', requireAuth, async (req, res) => {
  const parsed = updateBlockSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const block = await prisma.workshopContentBlock.update({
    where: { id: req.params.id as string },
    data: parsed.data,
  });
  res.json(block);
});

// Delete content block
workshopRouter.delete('/admin/content-blocks/:id', requireAuth, async (req, res) => {
  await prisma.workshopContentBlock.delete({
    where: { id: req.params.id as string },
  });
  res.json({ ok: true });
});
