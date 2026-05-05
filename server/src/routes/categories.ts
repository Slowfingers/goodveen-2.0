import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../lib/auth.js';

export const categoriesRouter = Router();

function isUniqueError(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
}

categoriesRouter.get('/', async (req, res) => {
  const onlyActive = req.query.onlyActive === 'true';
  const cats = await prisma.category.findMany({
    where: onlyActive ? { isActive: true } : undefined,
    orderBy: { sortOrder: 'asc' },
  });
  res.json(cats);
});

const createSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

categoriesRouter.post('/', requireAdmin, async (req, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const cat = await prisma.category.create({ 
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug,
        description: parsed.data.description ?? null,
        image: parsed.data.image ?? null,
        sortOrder: parsed.data.sortOrder ?? 0,
        isActive: parsed.data.isActive ?? true,
      }
    });
    res.status(201).json(cat);
  } catch (e) {
    if (isUniqueError(e)) return res.status(409).json({ error: 'A category with this slug already exists' });
    throw e;
  }
});


categoriesRouter.put('/:id', requireAdmin, async (req, res) => {
  const id = req.params.id;
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  try {
    const cat = await prisma.category.update({ where: { id: req.params.id as string }, data: parsed.data });
    res.json(cat);
  } catch (e) {
    if (isUniqueError(e)) return res.status(409).json({ error: 'A category with this slug already exists' });
    throw e;
  }
});

categoriesRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id as string } });
  res.status(204).end();
});
