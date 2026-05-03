-- ============================================================
-- Row-Level Security & policies
-- ============================================================

-- Helper: returns true when the current auth user is an admin
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'ADMIN'
  );
$$;

-- ============================================================
-- USERS
-- ============================================================
alter table public.users enable row level security;

drop policy if exists users_select_self on public.users;
create policy users_select_self on public.users
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists users_update_self on public.users;
create policy users_update_self on public.users
  for update using (auth.uid() = id or public.is_admin())
             with check (auth.uid() = id or public.is_admin());

drop policy if exists users_admin_all on public.users;
create policy users_admin_all on public.users
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- ADDRESSES (own only, admin all)
-- ============================================================
alter table public.addresses enable row level security;
drop policy if exists addresses_owner on public.addresses;
create policy addresses_owner on public.addresses
  for all using (user_id = auth.uid() or public.is_admin())
         with check (user_id = auth.uid() or public.is_admin());

-- ============================================================
-- PUBLIC READ: categories, products, sizes, images, events, filters, page_settings, about
-- (admin can mutate)
-- ============================================================
do $$
declare t text;
begin
  for t in select unnest(array[
    'categories','products','product_sizes','product_images',
    'events','filter_colors','filter_flower_types','page_settings','about_page'
  ])
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists %I_public_read on public.%I;', t, t);
    execute format('create policy %I_public_read on public.%I for select using (true);', t, t);
    execute format('drop policy if exists %I_admin_write on public.%I;', t, t);
    execute format('create policy %I_admin_write on public.%I for all using (public.is_admin()) with check (public.is_admin());', t, t);
  end loop;
end$$;

-- ============================================================
-- CART (own only)
-- ============================================================
alter table public.cart_items enable row level security;
drop policy if exists cart_items_owner on public.cart_items;
create policy cart_items_owner on public.cart_items
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists cart_items_admin on public.cart_items;
create policy cart_items_admin on public.cart_items
  for select using (public.is_admin());

-- ============================================================
-- ORDERS (own read; admin full)
-- ============================================================
alter table public.orders enable row level security;
drop policy if exists orders_select_owner on public.orders;
create policy orders_select_owner on public.orders
  for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists orders_insert_owner on public.orders;
create policy orders_insert_owner on public.orders
  for insert with check (user_id = auth.uid() or public.is_admin());

drop policy if exists orders_admin_write on public.orders;
create policy orders_admin_write on public.orders
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists orders_admin_delete on public.orders;
create policy orders_admin_delete on public.orders
  for delete using (public.is_admin());

alter table public.order_items enable row level security;
drop policy if exists order_items_owner on public.order_items;
create policy order_items_owner on public.order_items
  for select using (
    exists (select 1 from public.orders o where o.id = order_id
            and (o.user_id = auth.uid() or public.is_admin()))
  );
drop policy if exists order_items_insert on public.order_items;
create policy order_items_insert on public.order_items
  for insert with check (
    exists (select 1 from public.orders o where o.id = order_id
            and (o.user_id = auth.uid() or public.is_admin()))
  );
drop policy if exists order_items_admin on public.order_items;
create policy order_items_admin on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- PAYMENTS (admin only for now; client uses RPC for inserts)
-- ============================================================
alter table public.payments enable row level security;
drop policy if exists payments_admin on public.payments;
create policy payments_admin on public.payments
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists payments_select_owner on public.payments;
create policy payments_select_owner on public.payments
  for select using (
    exists (select 1 from public.orders o where o.id = order_id
            and (o.user_id = auth.uid() or public.is_admin()))
  );

alter table public.payment_logs enable row level security;
drop policy if exists payment_logs_admin on public.payment_logs;
create policy payment_logs_admin on public.payment_logs
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- PASSWORD RESET TOKENS (admin only)
-- ============================================================
alter table public.password_reset_tokens enable row level security;
drop policy if exists prt_admin on public.password_reset_tokens;
create policy prt_admin on public.password_reset_tokens
  for all using (public.is_admin()) with check (public.is_admin());
