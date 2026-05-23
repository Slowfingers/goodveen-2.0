// Auth utilities for Vercel Serverless
import type { VercelRequest } from '@vercel/node';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function getTokenFromRequest(req: VercelRequest): string | null {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.slice(7);
}

export function getUserFromRequest(req: VercelRequest): JWTPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(req: VercelRequest): JWTPayload {
  const user = getUserFromRequest(req);
  if (!user) throw new Error('Unauthorized');
  return user;
}

export function requireAdmin(req: VercelRequest): JWTPayload {
  const user = requireAuth(req);
  if (user.role !== 'ADMIN') throw new Error('Forbidden');
  return user;
}
