# Goodveen — Dev backend (Express + Prisma + SQLite)

Lightweight Node API used during development. Swap for Supabase
when going to production (see `/supabase/README.md`).

## First-time setup

```bash
# from repo root
npm run server:install      # installs server deps
npm run server:migrate      # applies prisma migrations to ./server/dev.db
npm run server:seed         # creates admin + categories + filters + page settings
```

Default admin (set in `server/.env`):

```
email:    admin@goodveen.com
password: admin12345
```

## Daily dev

```bash
npm run dev
```

Runs:
- Vite on `http://localhost:3000`
- API   on `http://localhost:3001` (proxied as `/api/*` and `/uploads/*`)

## Useful commands

```bash
npm run server:studio       # open Prisma Studio at :5555
npm run server:migrate      # create + apply a new migration
```

## File layout

```
server/
├── prisma/
│   ├── schema.prisma       # SQLite-flavored schema (port of GV)
│   └── migrations/         # generated; commit to git
├── src/
│   ├── index.ts            # express bootstrap
│   ├── seed.ts             # idempotent seed
│   ├── lib/{auth,prisma,json,serializers}.ts
│   └── routes/{auth,products,categories,events,orders,users,filters,pages,uploads}.ts
└── uploads/                # multer destination, served at /uploads/*
```

## Prod migration to Supabase

`schema.prisma` arrays are JSON-encoded (`String`) for SQLite.
Switching to Postgres / Supabase will require:

1. Change `provider = "postgresql"` and update `DATABASE_URL`.
2. Replace `String  @default("[]")` array fields with native
   `String[]` and a small migration to JSON-decode existing data.
3. Either keep this Express layer pointed at Supabase Postgres,
   or rewrite the frontend to use `@supabase/supabase-js` (the
   archived SQL migrations live in `/supabase/migrations`).
