import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../lib/auth.js';

export const addressesRouter = Router();

// List user's addresses
addressesRouter.get('/', requireAuth, async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user!.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });
  res.json(addresses);
});

// Create address
addressesRouter.post('/', requireAuth, async (req, res) => {
  const parsed = z
    .object({
      title: z.string().min(1).max(100),
      street: z.string().min(1).max(200),
      city: z.string().min(1).max(100),
      district: z.string().max(100).optional(),
      zipCode: z.string().max(20).optional(),
      isDefault: z.boolean().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  // If setting as default, unset others
  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user!.id, isDefault: true },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      userId: req.user!.id,
      title: parsed.data.title,
      street: parsed.data.street,
      city: parsed.data.city,
      district: parsed.data.district,
      zipCode: parsed.data.zipCode,
      isDefault: parsed.data.isDefault ?? false,
    },
  });
  res.status(201).json(address);
});

// Update address
addressesRouter.patch('/:id', requireAuth, async (req, res) => {
  const parsed = z
    .object({
      title: z.string().min(1).max(100).optional(),
      street: z.string().min(1).max(200).optional(),
      city: z.string().min(1).max(100).optional(),
      district: z.string().max(100).nullable().optional(),
      zipCode: z.string().max(20).nullable().optional(),
      isDefault: z.boolean().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const id = req.params.id as string;
  // Verify ownership
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Not found' });
  }

  // If setting as default, unset others
  if (parsed.data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.user!.id, isDefault: true, id: { not: id } },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data: parsed.data,
  });
  res.json(address);
});

// Delete address
addressesRouter.delete('/:id', requireAuth, async (req, res) => {
  const id = req.params.id as string;
  const existing = await prisma.address.findUnique({ where: { id } });
  if (!existing || existing.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Not found' });
  }
  await prisma.address.delete({ where: { id } });
  res.status(204).end();
});
