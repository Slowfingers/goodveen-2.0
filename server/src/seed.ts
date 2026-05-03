import 'dotenv/config';
import { prisma } from './lib/prisma.js';
import { hashPassword } from './lib/auth.js';

async function main() {
  // Admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@goodveen.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin12345';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    if (existing.role !== 'ADMIN') {
      await prisma.user.update({ where: { id: existing.id }, data: { role: 'ADMIN' } });
    }
    // eslint-disable-next-line no-console
    console.log(`[seed] Admin user ${adminEmail} already exists.`);
  } else {
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: await hashPassword(adminPassword),
        name: 'Goodveen Admin',
        role: 'ADMIN',
      },
    });
    // eslint-disable-next-line no-console
    console.log(`[seed] Admin user ${adminEmail} / ${adminPassword} created.`);
  }

  // Categories
  const categories = [
    { name: 'Bouquets', slug: 'bouquets', description: 'Hand-crafted artistic bouquets', sortOrder: 0 },
    { name: 'Dried flowers', slug: 'dried-flowers', description: 'Long-lasting dried compositions', sortOrder: 1 },
    { name: 'Plants', slug: 'plants', description: 'Indoor and decorative plants', sortOrder: 2 },
    { name: 'Accessories', slug: 'accessories', description: 'Vases, ribbons, candles, gift wrapping', sortOrder: 3 },
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  // Filter colors
  const colors = [
    ['Crimson', '#A31621'],
    ['Ivory', '#F5F0E1'],
    ['Emerald', '#2E7D5B'],
    ['Lavender', '#B59ED6'],
    ['Coral', '#FF7F61'],
    ['Turquoise', '#3FB7B0'],
    ['Charcoal', '#3A3A3A'],
    ['Rose Gold', '#D9A6A0'],
    ['Navy Blue', '#1F2A48'],
    ['Mustard Yellow', '#D6A93C'],
  ] as const;
  for (let i = 0; i < colors.length; i++) {
    const [name, hex] = colors[i];
    await prisma.filterColor.upsert({
      where: { name },
      update: {},
      create: { name, hex, sortOrder: i },
    });
  }

  // Filter flower types
  const types = ['Roses', 'Peonies', 'Tulips', 'Lilies', 'Orchids', 'Hydrangea', 'Eucalyptus', 'Ranunculus'];
  for (let i = 0; i < types.length; i++) {
    await prisma.filterFlowerType.upsert({
      where: { name: types[i] },
      update: {},
      create: { name: types[i], sortOrder: i },
    });
  }

  // About singleton
  await prisma.aboutPage.upsert({ where: { id: 'about' }, update: {}, create: { id: 'about' } });

  // Page settings
  const pages = [
    { pageKey: 'home', title: 'Goodveen', subtitle: 'A creative floral studio' },
    { pageKey: 'catalog', title: 'Bouquets', subtitle: 'emotions in bloom' },
    { pageKey: 'events', title: 'Events', subtitle: 'stories from the studio and beyond' },
    { pageKey: 'contacts', title: 'Contact us', subtitle: 'We respond within a day' },
  ];
  for (const p of pages) {
    await prisma.pageSetting.upsert({ where: { pageKey: p.pageKey }, update: {}, create: p });
  }

  // eslint-disable-next-line no-console
  console.log('[seed] done.');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
