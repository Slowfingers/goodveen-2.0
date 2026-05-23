// Catch-all API handler for Vercel
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from '../server/src/index';

// Cache the Express app instance
let app: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize Express app once
  if (!app) {
    app = createServer();
  }

  // Vercel provides the full path in req.url
  // We need to handle it with Express
  return new Promise((resolve, reject) => {
    app(req, res, (err: any) => {
      if (err) {
        console.error('[API Error]', err);
        res.status(500).json({ error: 'Internal server error' });
        return reject(err);
      }
      resolve(undefined);
    });
  });
}
