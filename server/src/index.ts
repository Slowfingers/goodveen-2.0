import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';

import { authOptional } from './lib/auth.js';
import { authRouter } from './routes/auth.js';
import { productsRouter } from './routes/products.js';
import { categoriesRouter } from './routes/categories.js';
import { eventsRouter } from './routes/events.js';
import { ordersRouter } from './routes/orders.js';
import { usersRouter } from './routes/users.js';
import { filtersRouter } from './routes/filters.js';
import { pagesRouter } from './routes/pages.js';
import { uploadsRouter } from './routes/uploads.js';
import { addressesRouter } from './routes/addresses.js';
import { workshopRouter } from './routes/workshop.js';

export function createServer() {
  const app = express();

  // Ensure upload folders exist (skip in serverless)
  if (process.env.VERCEL !== '1') {
    for (const folder of ['products', 'events', 'pages', 'about', 'workshop']) {
      const dir = path.join(process.cwd(), 'uploads', folder);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    }
  }

  const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173,http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        console.log('[CORS] Request origin:', origin);
        console.log('[CORS] Allowed origins:', ALLOWED_ORIGINS);
        // allow server-to-server (no origin) or whitelisted origins
        if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        // Allow 127.0.0.1 with any port (for browser preview proxy)
        if (origin && origin.match(/^http:\/\/127\.0\.0\.1:\d+$/)) return callback(null, true);
        console.log('[CORS] REJECTED:', origin);
        callback(new Error('Not allowed by CORS'));
      },
      credentials: true,
    }),
  );
  // Security headers
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

  // General rate limit: 200 requests per minute per IP
  app.use(
    rateLimit({
      windowMs: 60 * 1000,
      max: 200,
      standardHeaders: true,
      legacyHeaders: false,
      message: { error: 'Too many requests, please try again later.' },
    }),
  );

  // Strict rate limit for auth endpoints
  // Development: 50 requests per 15 minutes
  // Production: 10 requests per 15 minutes
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === 'production' ? 10 : 50,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again later.' },
  });

  app.use(express.json({ limit: '1mb' }));
  app.use(authOptional);

  // Static uploads (skip in serverless - use Supabase Storage)
  if (process.env.VERCEL !== '1') {
    app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  }

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use('/api/auth', authLimiter, authRouter);
  app.use('/api/products', productsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/events', eventsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/addresses', addressesRouter);
  app.use('/api/filters', filtersRouter);
  app.use('/api/pages', pagesRouter);
  app.use('/api/uploads', uploadsRouter);
  app.use('/api/workshop', workshopRouter);

  // Error handler
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    // eslint-disable-next-line no-console
    console.error('[server]', err);
    const isProd = process.env.NODE_ENV === 'production';
    res.status(500).json({ error: isProd ? 'Internal server error' : (err.message || 'Internal error') });
  });

  return app;
}

// Start server if not in serverless environment
if (process.env.VERCEL !== '1') {
  const app = createServer();
  const port = Number(process.env.PORT || 3001);
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[server] listening on http://localhost:${port}`);
  });
}
