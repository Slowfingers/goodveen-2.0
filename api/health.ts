import type { VercelRequest, VercelResponse } from '@vercel/node';
import { json, setCORS } from './_lib/response';

export default function handler(req: VercelRequest, res: VercelResponse) {
  setCORS(res, req.headers.origin);
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  return json(res, { ok: true, timestamp: new Date().toISOString() });
}
