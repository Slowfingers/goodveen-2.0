import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { encodeArr } from '../lib/json.js';
import { serializeProduct } from '../lib/serializers.js';
import { requireAdmin } from '../lib/auth.js';

export const productsRouter = Router();

function isUniqueError(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
}

// Public list
productsRouter.get('/', async (req, res) => {
  const { search, categoryId, onlyActive } = req.query as Record<string, string>;
  const products = await prisma.product.findMany({
    where: {
      ...(search ? { name: { contains: search } } : {}),
      ...(categoryId ? { categoryId } : {}),
      ...(onlyActive === 'true' ? { isActive: true } : {}),
    },
    include: { sizes: true, images: true, category: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(products.map((p) => ({ ...serializeProduct(p) })));
});

// Public single
productsRouter.get('/by-slug/:slug', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug as string },
    include: { sizes: { orderBy: { sortOrder: 'asc' } }, images: { orderBy: { sortOrder: 'asc' } }, category: true },
  });
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(serializeProduct(product));
});

productsRouter.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id as string },
    include: { sizes: { orderBy: { sortOrder: 'asc' } }, images: { orderBy: { sortOrder: 'asc' } }, category: true },
  });
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(serializeProduct(product));
});

// ===== Admin =====
const productInputSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  categoryId: z.string().min(1),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  composition: z.array(z.string()).optional(),
  careTips: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  flowerTypes: z.array(z.string()).optional(),
});

productsRouter.post('/', requireAdmin, async (req, res) => {
  const parsed = productInputSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;
  try {
    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description ?? null,
        categoryId: data.categoryId,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        composition: encodeArr(data.composition),
        careTips: encodeArr(data.careTips),
        colors: encodeArr(data.colors),
        flowerTypes: encodeArr(data.flowerTypes),
      },
      include: { sizes: true, images: true, category: true },
    });
    res.status(201).json(serializeProduct(product));
  } catch (e) {
    if (isUniqueError(e)) return res.status(409).json({ error: 'A product with this slug already exists' });
    throw e;
  }
});

productsRouter.put('/:id', requireAdmin, async (req, res) => {
  const parsed = productInputSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;
  const product = await prisma.product.update({
    where: { id: req.params.id as string },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      ...(data.composition !== undefined && { composition: encodeArr(data.composition) }),
      ...(data.careTips !== undefined && { careTips: encodeArr(data.careTips) }),
      ...(data.colors !== undefined && { colors: encodeArr(data.colors) }),
      ...(data.flowerTypes !== undefined && { flowerTypes: encodeArr(data.flowerTypes) }),
    },
    include: { sizes: true, images: true, category: true },
  });
  res.json(serializeProduct(product));
});

productsRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.product.delete({ where: { id: req.params.id as string } });
  res.status(204).end();
});

// ----- Sizes -----
const sizeCreateSchema = z.object({
  name: z.string().min(1),
  height: z.string().optional().nullable(),
  price: z.number().min(0),
  productId: z.string(),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

const sizeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  height: z.string().optional().nullable(),
  price: z.number().min(0).optional(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

productsRouter.post('/:id/sizes', requireAdmin, async (req, res) => {
  const parsed = sizeCreateSchema.safeParse({ ...req.body, productId: req.params.id as string });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const size = await prisma.productSize.create({ 
    data: {
      name: parsed.data.name,
      height: parsed.data.height ?? null,
      price: parsed.data.price,
      productId: parsed.data.productId,
      isAvailable: parsed.data.isAvailable ?? true,
      sortOrder: parsed.data.sortOrder ?? 0,
    }
  });
  res.status(201).json(size);
});

productsRouter.put('/sizes/:sizeId', requireAdmin, async (req, res) => {
  const parsed = sizeUpdateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const size = await prisma.productSize.update({ where: { id: req.params.sizeId as string }, data: parsed.data });
  res.json(size);
});

productsRouter.delete('/sizes/:sizeId', requireAdmin, async (req, res) => {
  await prisma.productSize.delete({ where: { id: req.params.sizeId as string } });
  res.status(204).end();
});

// ----- Images -----
const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
});

productsRouter.post('/:id/images', requireAdmin, async (req, res) => {
  const parsed = imageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const image = await prisma.productImage.create({
    data: { 
      url: parsed.data.url,
      alt: parsed.data.alt ?? null,
      sortOrder: parsed.data.sortOrder ?? 0,
      productId: req.params.id as string 
    },
  });
  res.status(201).json(image);
});

productsRouter.delete('/images/:imageId', requireAdmin, async (req, res) => {
  await prisma.productImage.delete({ where: { id: req.params.imageId as string } });
  res.status(204).end();
});
