-- ============================================================
-- Goodveen initial schema (ported from Prisma schema)
-- Run via Supabase SQL Editor or `supabase db push`
-- ============================================================

-- Required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Helper: updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

-- ============================================================
-- ENUMS
-- ============================================================
do $$ begin
  create type public.user_role as enum ('CUSTOMER', 'ADMIN');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.order_status as enum (
    'PENDING','CONFIRMED','PROCESSING','DELIVERING','DELIVERED','CANCELLED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.delivery_type as enum ('STANDARD','EXPRESS','SAME_DAY');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_method as enum ('CLICK','PAYME','UZUM','CARD','CASH');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.payment_status as enum (
    'PENDING','PROCESSING','COMPLETED','FAILED','CANCELLED','REFUNDED','EXPIRED'
  );
exception when duplicate_object then null; end $$;

-- ============================================================
-- USERS  (linked 1:1 with auth.users by id)
-- ============================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  name        text,
  phone       text,
  role        public.user_role not null default 'CUSTOMER',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists users_role_idx       on public.users(role);
create index if not exists users_created_at_idx on public.users(created_at);

drop trigger if exists trg_users_updated_at on public.users;
create trigger trg_users_updated_at before update on public.users
for each row execute function public.set_updated_at();

-- Auto-provision public.users when new auth.users created
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, email, name, role)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', null), 'CUSTOMER')
  on conflict (id) do nothing;
  return new;
end$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ADDRESSES
-- ============================================================
create table if not exists public.addresses (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  title       text not null,
  street      text not null,
  city        text not null,
  district    text,
  zip_code    text,
  is_default  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists addresses_user_idx on public.addresses(user_id);
drop trigger if exists trg_addresses_updated_at on public.addresses;
create trigger trg_addresses_updated_at before update on public.addresses
for each row execute function public.set_updated_at();

-- ============================================================
-- CATEGORIES
-- ============================================================
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text unique not null,
  description text,
  image       text,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index if not exists categories_active_sort_idx
  on public.categories(is_active, sort_order);
drop trigger if exists trg_categories_updated_at on public.categories;
create trigger trg_categories_updated_at before update on public.categories
for each row execute function public.set_updated_at();

-- ============================================================
-- PRODUCTS
-- ============================================================
create table if not exists public.products (
  id           uuid primary key default uuid_generate_v4(),
  name         text not null,
  slug         text unique not null,
  description  text,
  category_id  uuid not null references public.categories(id) on delete restrict,
  is_active    boolean not null default true,
  is_featured  boolean not null default false,
  composition  text[] not null default '{}',
  care_tips    text[] not null default '{}',
  colors       text[] not null default '{}',
  flower_types text[] not null default '{}',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists products_category_idx       on public.products(category_id);
create index if not exists products_active_idx         on public.products(is_active);
create index if not exists products_featured_idx       on public.products(is_featured);
create index if not exists products_created_at_idx     on public.products(created_at);
create index if not exists products_cat_active_idx     on public.products(category_id, is_active);
drop trigger if exists trg_products_updated_at on public.products;
create trigger trg_products_updated_at before update on public.products
for each row execute function public.set_updated_at();

-- ============================================================
-- PRODUCT SIZES
-- ============================================================
create table if not exists public.product_sizes (
  id           uuid primary key default uuid_generate_v4(),
  product_id   uuid not null references public.products(id) on delete cascade,
  name         text not null,            -- M / L / XL
  price        bigint not null,          -- store in tiyin (1 UZS = 100 tiyin) or cents
  height       text,                     -- "35 cm"
  is_available boolean not null default true,
  sort_order   int not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists product_sizes_product_idx on public.product_sizes(product_id);
drop trigger if exists trg_product_sizes_updated_at on public.product_sizes;
create trigger trg_product_sizes_updated_at before update on public.product_sizes
for each row execute function public.set_updated_at();

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
create table if not exists public.product_images (
  id          uuid primary key default uuid_generate_v4(),
  product_id  uuid not null references public.products(id) on delete cascade,
  url         text not null,
  alt         text,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images(product_id);

-- ============================================================
-- CART ITEMS
-- ============================================================
create table if not exists public.cart_items (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  product_id  uuid not null references public.products(id) on delete cascade,
  size_id     uuid not null references public.product_sizes(id) on delete cascade,
  quantity    int  not null default 1 check (quantity > 0),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, product_id, size_id)
);
create index if not exists cart_items_user_idx on public.cart_items(user_id);
drop trigger if exists trg_cart_items_updated_at on public.cart_items;
create trigger trg_cart_items_updated_at before update on public.cart_items
for each row execute function public.set_updated_at();

-- ============================================================
-- ORDERS
-- ============================================================
create table if not exists public.orders (
  id              uuid primary key default uuid_generate_v4(),
  order_number    text unique not null,
  user_id         uuid not null references public.users(id) on delete restrict,
  status          public.order_status   not null default 'PENDING',
  payment_status  public.payment_status not null default 'PENDING',
  delivery_type   public.delivery_type  not null default 'STANDARD',
  delivery_price  bigint not null default 0,
  delivery_date   timestamptz,
  delivery_time   text,
  address         text not null,
  city            text not null default 'Tashkent',
  phone           text not null,
  recipient_name  text,
  notes           text,
  subtotal        bigint not null,
  discount        bigint not null default 0,
  total           bigint not null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists orders_user_idx           on public.orders(user_id);
create index if not exists orders_status_idx         on public.orders(status);
create index if not exists orders_payment_status_idx on public.orders(payment_status);
create index if not exists orders_created_at_idx     on public.orders(created_at);
drop trigger if exists trg_orders_updated_at on public.orders;
create trigger trg_orders_updated_at before update on public.orders
for each row execute function public.set_updated_at();

-- ============================================================
-- ORDER ITEMS (snapshot of product info)
-- ============================================================
create table if not exists public.order_items (
  id            uuid primary key default uuid_generate_v4(),
  order_id      uuid not null references public.orders(id) on delete cascade,
  product_id    uuid not null references public.products(id) on delete restrict,
  size_id       uuid not null references public.product_sizes(id) on delete restrict,
  product_name  text   not null,
  size_name     text   not null,
  price         bigint not null,
  quantity      int    not null check (quantity > 0),
  created_at    timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items(order_id);

-- ============================================================
-- PAYMENTS
-- ============================================================
create table if not exists public.payments (
  id             uuid primary key default uuid_generate_v4(),
  order_id       uuid not null references public.orders(id) on delete cascade,
  method         public.payment_method  not null,
  amount         bigint not null,
  currency       text not null default 'UZS',
  status         public.payment_status not null default 'PENDING',
  external_id    text,
  provider_data  jsonb,
  error_code     text,
  error_message  text,
  paid_at        timestamptz,
  expires_at     timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists payments_order_idx       on public.payments(order_id);
create index if not exists payments_external_id_idx on public.payments(external_id);
create index if not exists payments_status_idx      on public.payments(status);
drop trigger if exists trg_payments_updated_at on public.payments;
create trigger trg_payments_updated_at before update on public.payments
for each row execute function public.set_updated_at();

create table if not exists public.payment_logs (
  id            uuid primary key default uuid_generate_v4(),
  payment_id    uuid not null references public.payments(id) on delete cascade,
  action        text not null,
  status        text not null,
  request_data  jsonb,
  response_data jsonb,
  ip_address    text,
  user_agent    text,
  created_at    timestamptz not null default now()
);
create index if not exists payment_logs_payment_idx on public.payment_logs(payment_id);

-- ============================================================
-- EVENTS
-- ============================================================
create table if not exists public.events (
  id             uuid primary key default uuid_generate_v4(),
  title          text not null,
  slug           text unique not null,
  description    text,
  content        text,
  image          text,
  content_images text[] not null default '{}',
  tag            text not null,
  size           text not null default 'half',
  is_published   boolean not null default false,
  published_at   timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists events_published_idx        on public.events(is_published);
create index if not exists events_tag_idx              on public.events(tag);
create index if not exists events_published_at_idx     on public.events(published_at);
create index if not exists events_pub_pubat_idx        on public.events(is_published, published_at);
drop trigger if exists trg_events_updated_at on public.events;
create trigger trg_events_updated_at before update on public.events
for each row execute function public.set_updated_at();

-- ============================================================
-- ABOUT PAGE (singleton row id = 'about')
-- ============================================================
create table if not exists public.about_page (
  id              text primary key default 'about',
  space_images    text[] not null default '{}',
  workshop_photos text[] not null default '{}',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
drop trigger if exists trg_about_page_updated_at on public.about_page;
create trigger trg_about_page_updated_at before update on public.about_page
for each row execute function public.set_updated_at();

-- ============================================================
-- FILTERS
-- ============================================================
create table if not exists public.filter_colors (
  id          uuid primary key default uuid_generate_v4(),
  name        text unique not null,
  hex         text not null,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_filter_colors_updated_at on public.filter_colors;
create trigger trg_filter_colors_updated_at before update on public.filter_colors
for each row execute function public.set_updated_at();

create table if not exists public.filter_flower_types (
  id          uuid primary key default uuid_generate_v4(),
  name        text unique not null,
  sort_order  int  not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_filter_flower_types_updated_at on public.filter_flower_types;
create trigger trg_filter_flower_types_updated_at before update on public.filter_flower_types
for each row execute function public.set_updated_at();

-- ============================================================
-- PAGE SETTINGS (covers / banners / hero)
-- ============================================================
create table if not exists public.page_settings (
  id          uuid primary key default uuid_generate_v4(),
  page_key    text unique not null,
  hero_image  text,
  hero_video  text,
  title       text,
  subtitle    text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
drop trigger if exists trg_page_settings_updated_at on public.page_settings;
create trigger trg_page_settings_updated_at before update on public.page_settings
for each row execute function public.set_updated_at();

-- ============================================================
-- PASSWORD RESET TOKENS (Supabase auth handles this natively,
-- table kept for parity with original system if needed)
-- ============================================================
create table if not exists public.password_reset_tokens (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.users(id) on delete cascade,
  token_hash  text unique not null,
  expires_at  timestamptz not null,
  used_at     timestamptz,
  created_at  timestamptz not null default now()
);
create index if not exists prt_user_idx       on public.password_reset_tokens(user_id);
create index if not exists prt_expires_at_idx on public.password_reset_tokens(expires_at);
