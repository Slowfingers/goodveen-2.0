import { Router } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import {
  comparePassword,
  hashPassword,
  requireAuth,
  signToken,
} from '../lib/auth.js';
import { serializeUser } from '../lib/serializers.js';

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

authRouter.post('/login', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await comparePassword(parsed.data.password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const token = signToken({ sub: user.id, role: user.role as 'CUSTOMER' | 'ADMIN' });
  res.json({ token, user: serializeUser(user) });
});

authRouter.post('/register', async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return res.status(409).json({ error: 'Email already in use' });

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      password: await hashPassword(parsed.data.password),
      name: parsed.data.name,
      role: 'CUSTOMER',
    },
  });
  const token = signToken({ sub: user.id, role: user.role as 'CUSTOMER' | 'ADMIN' });
  res.status(201).json({ token, user: serializeUser(user) });
});

authRouter.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json({ user: serializeUser(user) });
});

authRouter.patch('/profile', requireAuth, async (req, res) => {
  const parsed = z
    .object({
      name: z.string().min(1).max(100).optional(),
      phone: z.string().max(30).nullable().optional(),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.phone !== undefined && { phone: parsed.data.phone }),
    },
  });
  res.json({ user: serializeUser(user) });
});

authRouter.patch('/password', requireAuth, async (req, res) => {
  const parsed = z
    .object({
      currentPassword: z.string().min(1),
      newPassword: z.string().min(6),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ error: 'Not found' });
  const ok = await comparePassword(parsed.data.currentPassword, user.password);
  if (!ok) return res.status(401).json({ error: 'Incorrect current password' });
  const hashed = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({ where: { id: req.user!.id }, data: { password: hashed } });
  res.json({ ok: true });
});

authRouter.post('/request-reset', async (req, res) => {
  const parsed = z.object({ email: z.string().email() }).safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  // Always return success to avoid email enumeration
  if (!user) return res.json({ ok: true });
  // Generate token
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });
  // TODO: Send email with reset link containing token
  // For now, log it (in production, use email service)
  console.log(`Password reset token for ${user.email}: ${token}`);
  console.log(`Reset link: ${process.env.PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`);
  res.json({ ok: true });
});

authRouter.post('/reset-password', async (req, res) => {
  const parsed = z
    .object({
      token: z.string().min(1),
      newPassword: z.string().min(6),
    })
    .safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const tokenHash = crypto.createHash('sha256').update(parsed.data.token).digest('hex');
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });
  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Invalid or expired token' });
  }
  const hashed = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: resetToken.userId },
    data: { password: hashed },
  });
  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { usedAt: new Date() },
  });
  res.json({ ok: true });
});
