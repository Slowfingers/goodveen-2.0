// Vercel Serverless Function - handles all /api/* requests
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // For now, return a simple response to test
  // We'll need to set up the full Express app or migrate to serverless-friendly approach
  res.status(200).json({ 
    message: 'API is being migrated to Vercel serverless',
    path: req.url,
    method: req.method
  });
}
