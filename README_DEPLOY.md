# 🚀 Quick Deploy Checklist

## Pre-Deploy

- [ ] Установлены зависимости: `npm install` и `cd server && npm install`
- [ ] Supabase проект настроен (см. `SUPABASE_SETUP.md`)
- [ ] Создан bucket `uploads` в Supabase Storage (Public)
- [ ] Получен Service Role Key из Supabase

## Deploy to Vercel

### 1. Import Project
- Зайти на https://vercel.com
- Import GitHub repo: `Slowfingers/goodveen-2.0`
- Framework: **Vite**

### 2. Environment Variables

Добавить в Vercel:

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.hdqbwduzcakycshpihmp.supabase.co:5432/postgres
SUPABASE_URL=https://hdqbwduzcakycshpihmp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR_KEY]
JWT_SECRET=[GENERATE_32_CHARS]
ADMIN_EMAIL=admin@goodveen.com
ADMIN_PASSWORD=[CHANGE_THIS]
CORS_ORIGINS=https://your-project.vercel.app
NODE_ENV=production
VERCEL=1
```

### 3. Deploy

Нажать **Deploy** и подождать ~2 минуты.

## Post-Deploy

- [ ] Проверить `/api/health` → `{"ok":true}`
- [ ] Войти в `/admin` с admin credentials
- [ ] Загрузить тестовое изображение
- [ ] Проверить что изображение в Supabase Storage

## Troubleshooting

**Ошибка билда?** → Проверьте `VERCEL_DEPLOY.md`

**CORS ошибка?** → Добавьте домен в `CORS_ORIGINS`

**Изображения не загружаются?** → Проверьте bucket и Service Role Key

---

📖 **Полная документация**: `VERCEL_DEPLOY.md`
