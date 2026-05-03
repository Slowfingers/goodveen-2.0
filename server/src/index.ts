import 'dotenv/config';
import express from 'express';
import cors from 'cors';
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

const app = express();
const port = Number(process.env.PORT || 3001);

// Ensure upload folders exist
for (const folder of ['products', 'events', 'pages', 'about']) {
  const dir = path.join(process.cwd(), 'uploads', folder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: '5mb' }));
app.use(authOptional);

// Static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/events', eventsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/filters', filtersRouter);
app.use('/api/pages', pagesRouter);
app.use('/api/uploads', uploadsRouter);

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // eslint-disable-next-line no-console
  console.error('[server]', err);
  res.status(500).json({ error: err.message || 'Internal error' });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`[server] listening on http://localhost:${port}`);
});
