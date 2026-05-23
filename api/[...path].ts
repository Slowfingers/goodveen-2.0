// Catch-all API handler for Vercel
import type { VercelRequest, VercelResponse } from '@vercel/node';
import serverlessExpress from '@vendia/serverless-express';
import { createServer } from './server/src/index.js';

// Cache the serverless handler
let handler: any = null;

export default async function vercelHandler(req: VercelRequest, res: VercelResponse) {
  // Initialize serverless handler once
  if (!handler) {
    const app = createServer();
    handler = serverlessExpress({ app });
  }

  return handler(req, res);
}
