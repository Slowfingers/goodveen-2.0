// Response utilities for Vercel Serverless
import type { VercelResponse } from '@vercel/node';

export function json(res: VercelResponse, data: unknown, status = 200) {
  return res.status(status).json(data);
}

export function error(res: VercelResponse, message: string, status = 400) {
  return res.status(status).json({ error: message });
}

export function serverError(res: VercelResponse, err: unknown) {
  console.error('[API Error]', err);
  const message = err instanceof Error ? err.message : 'Internal server error';
  const isProd = process.env.NODE_ENV === 'production';
  return res.status(500).json({ 
    error: isProd ? 'Internal server error' : message 
  });
}

export function setCORS(res: VercelResponse, origin?: string) {
  const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map(s => s.trim());
  
  const requestOrigin = origin || '';
  const isAllowed = !requestOrigin || 
                    allowedOrigins.includes(requestOrigin) ||
                    requestOrigin.match(/^http:\/\/127\.0\.0\.1:\d+$/);
  
  if (isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', requestOrigin || '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  }
}
