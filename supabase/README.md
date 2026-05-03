# Goodveen — Supabase setup

## 1. Create Supabase project

1. https://supabase.com → **New project** (region: closest to you).
2. Save the **Project URL** and **anon public key** from
   *Project Settings → API*.

## 2. Configure env vars locally

```bash
cp .env.example .env.local
# fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
```

## 3. Run migrations

Open **SQL Editor** in Supabase dashboard and run, in order:

1. `supabase/migrations/0001_initial_schema.sql`
2. `supabase/migrations/0002_rls_policies.sql`
3. `supabase/migrations/0003_storage.sql`

(Or with the Supabase CLI: `supabase db push`.)

## 4. Create the admin user

1. **Authentication → Users → Add user**
   - email: `admin@goodveen.com`
   - password: *(your choice)*
   - check **Auto Confirm User**
2. Run `supabase/seed.sql` in SQL Editor — it promotes that
   email to `ADMIN` and seeds categories / filters / page covers.

> If you used a different email, edit `seed.sql` accordingly
> *before* running it.

## 5. Configure Auth

*Authentication → URL Configuration*

- **Site URL**: `http://localhost:5173` (dev) and your production
  domain.
- **Redirect URLs**: add both dev and prod origins.

*Authentication → Providers → Email*: enable, disable
*confirm email* during dev if desired.

## 6. (Optional) Generate typed schema

```bash
npx supabase gen types typescript --project-id <PROJECT-REF> \
  > src/lib/supabase/database.types.ts
```

You can then narrow the manual types in
`src/lib/supabase/types.ts` to use the generated ones.
