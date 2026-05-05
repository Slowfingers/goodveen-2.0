import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAdmin } from '../lib/auth.js';
import { serializeUser } from '../lib/serializers.js';

export const usersRouter = Router();

usersRouter.get('/', requireAdmin, async (_req, res) => {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(users.map(serializeUser));
});

usersRouter.patch('/:id/role', requireAdmin, async (req, res) => {
  const parsed = z.object({ role: z.enum(['CUSTOMER', 'ADMIN']) }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await prisma.user.update({
    where: { id: req.params.id as string },
    data: { role: parsed.data.role },
  });
  res.json(serializeUser(user));
});
