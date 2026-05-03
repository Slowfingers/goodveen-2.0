-- ============================================================
-- Storage buckets
-- (Run after 0001+0002. Buckets are public for read.)
-- ============================================================

insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('event-images',   'event-images',   true),
  ('page-covers',    'page-covers',    true),
  ('about-images',   'about-images',   true)
on conflict (id) do nothing;

-- Public read on every bucket above
drop policy if exists "Public read storage" on storage.objects;
create policy "Public read storage" on storage.objects
  for select using (
    bucket_id in ('product-images','event-images','page-covers','about-images')
  );

-- Only admins can write/delete
drop policy if exists "Admin write storage" on storage.objects;
create policy "Admin write storage" on storage.objects
  for insert with check (
    bucket_id in ('product-images','event-images','page-covers','about-images')
    and public.is_admin()
  );

drop policy if exists "Admin update storage" on storage.objects;
create policy "Admin update storage" on storage.objects
  for update using (
    bucket_id in ('product-images','event-images','page-covers','about-images')
    and public.is_admin()
  ) with check (
    bucket_id in ('product-images','event-images','page-covers','about-images')
    and public.is_admin()
  );

drop policy if exists "Admin delete storage" on storage.objects;
create policy "Admin delete storage" on storage.objects
  for delete using (
    bucket_id in ('product-images','event-images','page-covers','about-images')
    and public.is_admin()
  );
