import bcrypt from 'bcryptjs';

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@goodveen.com';
  const password = process.env.ADMIN_PASSWORD || 'admin12345';
  
  const hash = await bcrypt.hash(password, 10);
  
  console.log('-- Run this SQL in Supabase:');
  console.log(`
INSERT INTO users (email, password, name, role)
VALUES (
  '${email}',
  '${hash}',
  'Administrator',
  'ADMIN'
)
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  role = 'ADMIN';
  `);
}

main().catch(console.error);
