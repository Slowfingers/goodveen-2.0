-- ============================================================
-- Goodveen seed data
-- Run AFTER all migrations and AFTER you have created the admin
-- user via Supabase Auth (Dashboard → Authentication → Users → Add user).
-- Then run the UPDATE below using that user's email to grant ADMIN.
-- ============================================================

-- 1) Promote a user to ADMIN by email
update public.users
   set role = 'ADMIN'
 where email = 'admin@goodveen.com';

-- 2) Categories
insert into public.categories (name, slug, description, sort_order, is_active)
values
  ('Bouquets',      'bouquets',      'Hand-crafted artistic bouquets',          0, true),
  ('Dried flowers', 'dried-flowers', 'Long-lasting dried compositions',         1, true),
  ('Plants',        'plants',        'Indoor and decorative plants',            2, true),
  ('Accessories',   'accessories',   'Vases, ribbons, candles, gift wrapping',  3, true)
on conflict (slug) do nothing;

-- 3) Filter colors
insert into public.filter_colors (name, hex, sort_order)
values
  ('Crimson',         '#A31621', 0),
  ('Ivory',           '#F5F0E1', 1),
  ('Emerald',         '#2E7D5B', 2),
  ('Lavender',        '#B59ED6', 3),
  ('Coral',           '#FF7F61', 4),
  ('Turquoise',       '#3FB7B0', 5),
  ('Charcoal',        '#3A3A3A', 6),
  ('Rose Gold',       '#D9A6A0', 7),
  ('Navy Blue',       '#1F2A48', 8),
  ('Mustard Yellow',  '#D6A93C', 9)
on conflict (name) do nothing;

-- 4) Filter flower types
insert into public.filter_flower_types (name, sort_order)
values
  ('Roses',      0),
  ('Peonies',    1),
  ('Tulips',     2),
  ('Lilies',     3),
  ('Orchids',    4),
  ('Hydrangea',  5),
  ('Eucalyptus', 6),
  ('Ranunculus', 7)
on conflict (name) do nothing;

-- 5) About page singleton
insert into public.about_page (id, space_images, workshop_photos)
values ('about', '{}', '{}')
on conflict (id) do nothing;

-- 6) Page settings (covers)
insert into public.page_settings (page_key, hero_image, title, subtitle)
values
  ('home',     null, 'Goodveen',    'A creative floral studio'),
  ('catalog',  null, 'Bouquets',    'emotions in bloom'),
  ('events',   null, 'Events',      'stories from the studio and beyond'),
  ('contacts', null, 'Contact us',  'We respond within a day')
on conflict (page_key) do nothing;

-- 7) Sample product (optional) — comment out if not needed
-- with c as (select id from public.categories where slug = 'bouquets')
-- insert into public.products (name, slug, description, category_id, is_active, is_featured,
--                              composition, care_tips, colors, flower_types)
-- values (
--   'Wild Serenity', 'wild-serenity',
--   'Lavender, peonies, and thistles — effortless harmony of nature and calm.',
--   (select id from c), true, true,
--   array['Garden roses · 9 stems','French peonies · 5 stems','Lavender · 7 stems'],
--   array['Trim stems every 2 days','Change water daily','Avoid direct sunlight'],
--   array['Lavender','Ivory'],
--   array['Roses','Peonies']
-- )
-- on conflict (slug) do nothing;
