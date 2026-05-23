// Supabase Storage adapter for file uploads
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabase && supabaseUrl && supabaseKey) {
    supabase = createClient(supabaseUrl, supabaseKey);
  }
  return supabase;
}

export async function uploadFile(
  folder: string,
  filename: string,
  filepath: string,
): Promise<string> {
  const client = getSupabaseClient();
  
  // If Supabase is not configured, use local storage
  if (!client || process.env.VERCEL !== '1') {
    return `/uploads/${folder}/${filename}`;
  }

  try {
    const fileBuffer = fs.readFileSync(filepath);
    const storagePath = `${folder}/${filename}`;

    const { data, error } = await client.storage
      .from('uploads')
      .upload(storagePath, fileBuffer, {
        contentType: getContentType(filename),
        upsert: true,
      });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = client.storage
      .from('uploads')
      .getPublicUrl(storagePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('[storage] Upload failed:', error);
    // Fallback to local storage
    return `/uploads/${folder}/${filename}`;
  }
}

export async function deleteFile(url: string): Promise<void> {
  const client = getSupabaseClient();
  
  if (!client || process.env.VERCEL !== '1') {
    // Local storage - delete file from disk
    try {
      const filepath = path.join(process.cwd(), url.replace(/^\//, ''));
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
    } catch (error) {
      console.error('[storage] Delete failed:', error);
    }
    return;
  }

  try {
    // Extract path from Supabase URL
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/uploads\/(.+)$/);
    if (!pathMatch) return;

    const storagePath = pathMatch[1];
    await client.storage.from('uploads').remove([storagePath]);
  } catch (error) {
    console.error('[storage] Delete failed:', error);
  }
}

function getContentType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const types: Record<string, string> = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
  };
  return types[ext] || 'application/octet-stream';
}
