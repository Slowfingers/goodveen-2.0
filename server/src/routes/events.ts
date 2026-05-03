import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { encodeArr } from '../lib/json.js';
import { serializeEvent } from '../lib/serializers.js';
import { requireAdmin } from '../lib/auth.js';

export const eventsRouter = Router();

function isUniqueError(e: unknown) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
}

eventsRouter.get('/', async (req, res) => {
  const { onlyPublished, tag } = req.query as Record<string, string>;
  const events = await prisma.event.findMany({
    where: {
      ...(onlyPublished === 'true' ? { isPublished: true } : {}),
      ...(tag ? { tag } : {}),
    },
    orderBy: { publishedAt: 'desc' },
  });
  res.json(events.map(serializeEvent));
});

eventsRouter.get('/by-slug/:slug', async (req, res) => {
  const event = await prisma.event.findUnique({ where: { slug: req.params.slug } });
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json(serializeEvent(event));
});

eventsRouter.get('/:id', async (req, res) => {
  const event = await prisma.event.findUnique({ where: { id: req.params.id } });
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json(serializeEvent(event));
});

const schema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional().nullable(),
  content: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  contentImages: z.array(z.string()).optional(),
  tag: z.string().min(1),
  size: z.enum(['half', 'full']).optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
});

eventsRouter.post('/', requireAdmin, async (req, res) => {
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;
  try {
    const event = await prisma.event.create({
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description ?? null,
        content: data.content ?? null,
        image: data.image ?? null,
        contentImages: encodeArr(data.contentImages),
        tag: data.tag,
        size: data.size ?? 'half',
        isPublished: data.isPublished ?? false,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
    });
    res.status(201).json(serializeEvent(event));
  } catch (e) {
    if (isUniqueError(e)) return res.status(409).json({ error: 'An event with this slug already exists' });
    throw e;
  }
});

eventsRouter.put('/:id', requireAdmin, async (req, res) => {
  const parsed = schema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;
  const event = await prisma.event.update({
    where: { id: req.params.id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.content !== undefined && { content: data.content }),
      ...(data.image !== undefined && { image: data.image }),
      ...(data.contentImages !== undefined && { contentImages: encodeArr(data.contentImages) }),
      ...(data.tag !== undefined && { tag: data.tag }),
      ...(data.size !== undefined && { size: data.size }),
      ...(data.isPublished !== undefined && { isPublished: data.isPublished }),
      ...(data.publishedAt !== undefined && {
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      }),
    },
  });
  res.json(serializeEvent(event));
});

eventsRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.event.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
