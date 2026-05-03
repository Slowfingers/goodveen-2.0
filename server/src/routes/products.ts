import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { encodeArr } from '../lib/json.js';
import { serializeProduct } from '../lib/serializers.js';
import { requireAdmin } from '../lib/auth.js';

export const productsRouter = Router();

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
    where: { slug: req.params.slug },
    include: { sizes: { orderBy: { sortOrder: 'asc' } }, images: { orderBy: { sortOrder: 'asc' } }, category: true },
  });
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(serializeProduct(product));
});

productsRouter.get('/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
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
});

productsRouter.put('/:id', requireAdmin, async (req, res) => {
  const parsed = productInputSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;
  const product = await prisma.product.update({
    where: { id: req.params.id },
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
  await prisma.product.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

// ----- Sizes -----
const sizeSchema = z.object({
  productId: z.string(),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  height: z.string().optional().nullable(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

productsRouter.post('/:id/sizes', requireAdmin, async (req, res) => {
  const parsed = sizeSchema.safeParse({ ...req.body, productId: req.params.id });
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const size = await prisma.productSize.create({ data: parsed.data });
  res.status(201).json(size);
});

productsRouter.put('/sizes/:sizeId', requireAdmin, async (req, res) => {
  const parsed = sizeSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const size = await prisma.productSize.update({ where: { id: req.params.sizeId }, data: parsed.data });
  res.json(size);
});

productsRouter.delete('/sizes/:sizeId', requireAdmin, async (req, res) => {
  await prisma.productSize.delete({ where: { id: req.params.sizeId } });
  res.status(204).end();
});

// ----- Images -----
const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
});

productsRouter.post('/:id/images', requireAdmin, async (req, res) => {
  const parsed = imageSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const image = await prisma.productImage.create({
    data: { ...parsed.data, productId: req.params.id },
  });
  res.status(201).json(image);
});

productsRouter.delete('/images/:imageId', requireAdmin, async (req, res) => {
  await prisma.productImage.delete({ where: { id: req.params.imageId } });
  res.status(204).end();
});
