import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../lib/auth.js';

export const filtersRouter = Router();

const colorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const flowerTypeSchema = z.object({
  name: z.string().min(1),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

filtersRouter.get('/colors', async (req, res) => {
  const onlyActive = req.query.onlyActive === 'true';
  const colors = await prisma.filterColor.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    orderBy: { sortOrder: 'asc' },
  });
  res.json(colors);
});

filtersRouter.post('/colors', requireAdmin, async (req, res) => {
  const parsed = colorSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const color = await prisma.filterColor.create({ data: parsed.data });
  res.status(201).json(color);
});

filtersRouter.put('/colors/:id', requireAdmin, async (req, res) => {
  const parsed = colorSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const color = await prisma.filterColor.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(color);
});

filtersRouter.delete('/colors/:id', requireAdmin, async (req, res) => {
  await prisma.filterColor.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

filtersRouter.get('/flower-types', async (req, res) => {
  const onlyActive = req.query.onlyActive === 'true';
  const items = await prisma.filterFlowerType.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    orderBy: { sortOrder: 'asc' },
  });
  res.json(items);
});

filtersRouter.post('/flower-types', requireAdmin, async (req, res) => {
  const parsed = flowerTypeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const item = await prisma.filterFlowerType.create({ data: parsed.data });
  res.status(201).json(item);
});

filtersRouter.put('/flower-types/:id', requireAdmin, async (req, res) => {
  const parsed = flowerTypeSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const item = await prisma.filterFlowerType.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(item);
});

filtersRouter.delete('/flower-types/:id', requireAdmin, async (req, res) => {
  await prisma.filterFlowerType.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
