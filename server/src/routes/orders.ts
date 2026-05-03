import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAdmin, requireAuth } from '../lib/auth.js';

export const ordersRouter = Router();

// Admin: list all
ordersRouter.get('/', requireAdmin, async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { user: { select: { id: true, email: true, name: true, phone: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

// Customer: list my orders
ordersRouter.get('/mine', requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(orders);
});

ordersRouter.get('/:id', requireAuth, async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      items: true,
      user: { select: { id: true, email: true, name: true, phone: true } },
      payments: true,
    },
  });
  if (!order) return res.status(404).json({ error: 'Not found' });
  if (req.user!.role !== 'ADMIN' && order.userId !== req.user!.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  res.json(order);
});

const updateSchema = z.object({
  status: z
    .enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'DELIVERING', 'DELIVERED', 'CANCELLED'])
    .optional(),
  paymentStatus: z
    .enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED', 'EXPIRED'])
    .optional(),
});

ordersRouter.patch('/:id', requireAdmin, async (req, res) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const order = await prisma.order.update({ where: { id: req.params.id }, data: parsed.data });
  res.json(order);
});

ordersRouter.delete('/:id', requireAdmin, async (req, res) => {
  await prisma.order.delete({ where: { id: req.params.id } });
  res.status(204).end();
});
