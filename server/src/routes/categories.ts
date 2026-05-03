import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../lib/auth.js';

export const categoriesRouter = Router();

categoriesRouter.get('/', async (req, res) => {
  const onlyActive = req.query.onlyActive === 'true';
  const cats = await prisma.category.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    orderBy: { sortOrder: 'asc' },
  });
  res.json(cats);
});

const schema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

categoriesRouter.post('/', requireAdmin, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const cat = await prisma.category.create({ data: parsed.data });
  res.status(201).json(cat);
});

categoriesRouter.put('/:id', requireAdmin, async (req, res) => {
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const cat = await prisma.category.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(cat);
});

categoriesRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
