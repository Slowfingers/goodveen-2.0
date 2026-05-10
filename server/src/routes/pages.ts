import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../lib/auth.js';
import { encodeArr } from '../lib/json.js';
import { serializeAbout } from '../lib/serializers.js';

export const pagesRouter = Router();

// ===== Page covers / settings =====
pagesRouter.get('/settings', async (_req, res) => {
  const items = await prisma.pageSetting.findMany({ orderBy: { pageKey: 'asc' } });
  res.json(items);
});

const pageSettingSchema = z.object({
  pageKey: z.string().min(1),
  heroImage: z.string().optional().nullable(),
  heroVideo: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
});

pagesRouter.put('/settings', requireAdmin, async (req, res) => {
  const parsed = pageSettingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { pageKey, ...rest } = parsed.data;
  const item = await prisma.pageSetting.upsert({
    where: { pageKey },
    update: rest,
    create: { pageKey, ...rest },
  });
  res.json(item);
});

// ===== About page =====
pagesRouter.get('/about', async (_req, res) => {
  let about = await prisma.aboutPage.findUnique({ where: { id: 'about' } });
  if (!about) {
    about = await prisma.aboutPage.create({ data: { id: 'about' } });
  }
  res.json(serializeAbout(about));
});

const aboutSchema = z.object({
  spaceImages: z.array(z.string()).optional(),
  workshopPhotos: z.array(z.string()).optional(),
});

pagesRouter.put('/about', requireAdmin, async (req, res) => {
  const parsed = aboutSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;
  const about = await prisma.aboutPage.upsert({
    where: { id: 'about' },
    update: {
      ...(data.spaceImages !== undefined && { spaceImages: encodeArr(data.spaceImages) }),
      ...(data.workshopPhotos !== undefined && { workshopPhotos: encodeArr(data.workshopPhotos) }),
    },
    create: {
      id: 'about',
      spaceImages: encodeArr(data.spaceImages),
      workshopPhotos: encodeArr(data.workshopPhotos),
    },
  });
  res.json(serializeAbout(about));
});

// ===== Contact settings =====
pagesRouter.get('/contact', async (_req, res) => {
  let contact = await prisma.contactSettings.findUnique({ where: { id: 'contact' } });
  if (!contact) {
    contact = await prisma.contactSettings.create({ data: { id: 'contact' } });
  }
  const phones = JSON.parse(contact.phones || '[]');
  res.json({ ...contact, phones });
});

const contactSchema = z.object({
  address: z.string().optional(),
  addressNote: z.string().optional().nullable(),
  phones: z.array(z.string()).optional(),
  email: z.string().optional(),
  emailNote: z.string().optional().nullable(),
  openHours: z.string().optional(),
  instagram: z.string().optional().nullable(),
  facebook: z.string().optional().nullable(),
  telegram: z.string().optional().nullable(),
});

pagesRouter.put('/contact', requireAdmin, async (req, res) => {
  const parsed = contactSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const data = parsed.data;
  const contact = await prisma.contactSettings.upsert({
    where: { id: 'contact' },
    update: {
      ...(data.address !== undefined && { address: data.address }),
      ...(data.addressNote !== undefined && { addressNote: data.addressNote }),
      ...(data.phones !== undefined && { phones: JSON.stringify(data.phones) }),
      ...(data.email !== undefined && { email: data.email }),
      ...(data.emailNote !== undefined && { emailNote: data.emailNote }),
      ...(data.openHours !== undefined && { openHours: data.openHours }),
      ...(data.instagram !== undefined && { instagram: data.instagram }),
      ...(data.facebook !== undefined && { facebook: data.facebook }),
      ...(data.telegram !== undefined && { telegram: data.telegram }),
    },
    create: {
      id: 'contact',
      address: data.address || 'Tashkent, Uzbekiston Ovozi street 2/1',
      addressNote: data.addressNote,
      phones: JSON.stringify(data.phones || []),
      email: data.email || 'hello@goodveen.uz',
      emailNote: data.emailNote,
      openHours: data.openHours || 'Every day · 09:00 — 21:00',
      instagram: data.instagram,
      facebook: data.facebook,
      telegram: data.telegram,
    },
  });
  const phones = JSON.parse(contact.phones || '[]');
  res.json({ ...contact, phones });
});
