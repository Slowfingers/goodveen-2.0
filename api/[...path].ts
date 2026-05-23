// Catch-all API handler for Vercel
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from './server/src/index.js';

// Cache the Express app instance
let app: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize Express app once
  if (!app) {
    app = createServer();
  }

  // Clean up Vercel-specific headers that might cause issues
  // Remove problematic X-Forwarded headers
  delete req.headers['x-forwarded-host'];
  delete req.headers['x-forwarded-proto'];
  
  // Ensure req.url starts with /api
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + req.url;
  }

  // Handle the request with Express
  return new Promise((resolve, reject) => {
    app(req, res, (err: any) => {
      if (err) {
        console.error('[API Error]', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Internal server error' });
        }
        return reject(err);
      }
      resolve(undefined);
    });
  });
}
