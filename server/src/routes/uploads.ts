import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { requireAdmin } from '../lib/auth.js';
import { uploadFile } from '../lib/storage.js';

export const uploadsRouter = Router();

const ALLOWED_FOLDERS = ['products', 'events', 'pages', 'about', 'workshop'] as const;
type Folder = (typeof ALLOWED_FOLDERS)[number];

const storage = multer.diskStorage({
  destination(req, _file, cb) {
    const folder = (req.params.folder as Folder) ?? 'misc';
    cb(null, path.join(process.cwd(), 'uploads', folder));
  },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || '.bin';
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  fileFilter(_req, file, cb) {
    if (!/^image\/(png|jpe?g|webp|gif|avif|svg\+xml)$/.test(file.mimetype)) {
      return cb(new Error('Only image uploads are allowed'));
    }
    cb(null, true);
  },
});

uploadsRouter.post('/:folder', requireAdmin, (req, res, next) => {
  if (!ALLOWED_FOLDERS.includes(req.params.folder as Folder)) {
    return res.status(400).json({ error: 'Invalid folder' });
  }
  upload.single('file')(req, res, async (err) => {
    if (err) return next(err);
    if (!req.file) return res.status(400).json({ error: 'No file' });
    
    try {
      // Upload to Supabase Storage (or local in dev)
      const url = await uploadFile(
        req.params.folder as string,
        req.file.filename,
        req.file.path
      );
      
      res.status(201).json({ url });
    } catch (error) {
      next(error);
    }
  });
});
