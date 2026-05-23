// Vercel Serverless Function entry point
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createServer } from '../server/src/index';

let app: any = null;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!app) {
    app = await createServer();
  }
  
  return app(req, res);
}
