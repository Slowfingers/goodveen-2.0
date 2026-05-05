import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../lib/auth.js';

function isUniqueError(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
}

export const filtersRouter = Router();

const colorCreateSchema = z.object({
  name: z.string().min(1),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const colorUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const flowerTypeCreateSchema = z.object({
  name: z.string().min(1),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const flowerTypeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
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
  const parsed = colorCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const color = await prisma.filterColor.create({ 
      data: {
        name: parsed.data.name,
        hex: parsed.data.hex,
        sortOrder: parsed.data.sortOrder ?? 0,
        isActive: parsed.data.isActive ?? true,
      }
    });
    res.status(201).json(color);
  } catch (e) {
    if (isUniqueError(e)) return res.status(409).json({ error: 'A color with this name already exists' });
    throw e;
  }
});

filtersRouter.put('/colors/:id', requireAdmin, async (req, res) => {
  const parsed = colorUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const color = await prisma.filterColor.update({ where: { id: req.params.id as string }, data: parsed.data });
    res.json(color);
  } catch (e) {
    if (isUniqueError(e)) return res.status(409).json({ error: 'A color with this name already exists' });
    throw e;
  }
});

filtersRouter.delete('/colors/:id', requireAdmin, async (req, res) => {
  await prisma.filterColor.delete({ where: { id: req.params.id as string } });
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
  const parsed = flowerTypeCreateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const item = await prisma.filterFlowerType.create({ 
      data: {
        name: parsed.data.name,
        sortOrder: parsed.data.sortOrder ?? 0,
        isActive: parsed.data.isActive ?? true,
      }
    });
    res.status(201).json(item);
  } catch (e) {
    if (isUniqueError(e)) return res.status(409).json({ error: 'A flower type with this name already exists' });
    throw e;
  }
});

filtersRouter.put('/flower-types/:id', requireAdmin, async (req, res) => {
  const parsed = flowerTypeUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const item = await prisma.filterFlowerType.update({ where: { id: req.params.id as string }, data: parsed.data });
    res.json(item);
  } catch (e) {
    if (isUniqueError(e)) return res.status(409).json({ error: 'A flower type with this name already exists' });
    throw e;
  }
});

filtersRouter.delete('/flower-types/:id', requireAdmin, async (req, res) => {
  await prisma.filterFlowerType.delete({ where: { id: req.params.id as string } });
  res.status(204).end();
});
