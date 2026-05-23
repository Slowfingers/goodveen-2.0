# 🔐 Настройка Environment Variables в Vercel

## Шаг 1: Откройте настройки проекта

1. Зайдите на https://vercel.com/tashflora-s-projects/goodveen
2. Settings → Environment Variables

## Шаг 2: Добавьте следующие переменные

### Database (Supabase)

```
DATABASE_URL
```
**Value:**
```
postgresql://postgres:[YOUR_PASSWORD]@db.hdqbwduzcakycshpihmp.supabase.co:5432/postgres
```
- Замените `[YOUR_PASSWORD]` на пароль от Supabase БД
- Получить пароль: https://supabase.com/dashboard/project/hdqbwduzcakycshpihmp/settings/database

---

### Supabase Storage

```
SUPABASE_URL
```
**Value:**
```
https://hdqbwduzcakycshpihmp.supabase.co
```

```
SUPABASE_SERVICE_ROLE_KEY
```
**Value:** (получить из Supabase)
- Откройте: https://supabase.com/dashboard/project/hdqbwduzcakycshpihmp/settings/api
- Скопируйте **service_role** key (секретный!)

---

### JWT Secret

```
JWT_SECRET
```
**Value:** (сгенерировать новый)

Запустите в терминале:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Скопируйте результат.

---

### Admin Credentials

```
ADMIN_EMAIL
```
**Value:**
```
admin@goodveen.com
```

```
ADMIN_PASSWORD
```
**Value:** (придумайте надежный пароль)
```
[YOUR_STRONG_PASSWORD]
```

---

### CORS

```
CORS_ORIGINS
```
**Value:**
```
https://goodveen.vercel.app
```

---

### Node Environment

```
NODE_ENV
```
**Value:**
```
production
```

```
VERCEL
```
**Value:**
```
1
```

---

## Шаг 3: Redeploy

После добавления всех переменных:

1. Deployments → Latest Deployment → ⋯ → Redeploy
2. ИЛИ просто сделайте новый push в Git (автодеплой)

---

## ✅ Проверка

После редеплоя проверьте:

1. **Health check**: https://goodveen.vercel.app/api/health
   - Должно вернуть: `{"ok":true}`

2. **Categories**: https://goodveen.vercel.app/api/categories?onlyActive=true
   - Должно вернуть массив категорий

3. **Frontend**: https://goodveen.vercel.app
   - Должен загрузиться сайт без ошибок 500

---

## 🐛 Troubleshooting

### Ошибка "Database connection failed"

- Проверьте `DATABASE_URL` - правильный ли пароль
- Проверьте что Supabase проект активен

### Ошибка "Unauthorized" при входе в админку

- Проверьте `JWT_SECRET` - должен быть установлен
- Проверьте `ADMIN_EMAIL` и `ADMIN_PASSWORD`

### CORS ошибки

- Убедитесь что `CORS_ORIGINS` включает `https://goodveen.vercel.app`
