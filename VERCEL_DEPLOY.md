# 🚀 Production Deployment Guide - Vercel + Supabase

## Архитектура

```
Frontend (React) → Vercel (CDN + Serverless)
Backend API (Express) → Vercel Serverless Functions
Database → Supabase PostgreSQL
File Storage → Supabase Storage
```

## Предварительные требования

1. ✅ Supabase проект уже настроен (см. `SUPABASE_SETUP.md`)
2. ✅ Все миграции применены к Supabase БД
3. ✅ Админ создан: `admin@goodveen.com` / `admin12345`

## Шаг 1: Установка зависимостей

```bash
# Установить Supabase SDK
cd server
npm install @supabase/supabase-js

# Установить Vercel types
cd ..
npm install --save-dev @vercel/node
```

## Шаг 2: Настройка Supabase Storage

### 2.1 Создать bucket для загрузок

1. Откройте https://supabase.com/dashboard/project/hdqbwduzcakycshpihmp/storage/buckets
2. Создайте новый **Public bucket** с именем `uploads`
3. Настройте политики доступа:

```sql
-- Разрешить публичное чтение
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'uploads' );

-- Разрешить загрузку только аутентифицированным (через service role)
CREATE POLICY "Authenticated Upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'uploads' );

-- Разрешить удаление только аутентифицированным
CREATE POLICY "Authenticated Delete"
ON storage.objects FOR DELETE
USING ( bucket_id = 'uploads' );
```

### 2.2 Получить Service Role Key

1. Откройте https://supabase.com/dashboard/project/hdqbwduzcakycshpihmp/settings/api
2. Скопируйте **service_role key** (секретный ключ)
3. ⚠️ **ВАЖНО**: Этот ключ НЕ должен попасть в frontend код!

## Шаг 3: Деплой на Vercel

### 3.1 Подключить репозиторий

1. Зайдите на https://vercel.com
2. Нажмите **Add New Project**
3. Импортируйте ваш GitHub репозиторий `Slowfingers/goodveen-2.0`
4. Выберите **Framework Preset**: Vite

### 3.2 Настроить Environment Variables

В настройках проекта Vercel добавьте:

```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.hdqbwduzcakycshpihmp.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://hdqbwduzcakycshpihmp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]

# JWT Secret (сгенерируйте новый для продакшна!)
JWT_SECRET=[GENERATE_RANDOM_STRING_MIN_32_CHARS]

# Admin credentials
ADMIN_EMAIL=admin@goodveen.com
ADMIN_PASSWORD=[CHANGE_THIS_PASSWORD]

# CORS (добавьте ваш домен)
CORS_ORIGINS=https://yourdomain.vercel.app,https://yourdomain.com

# Node environment
NODE_ENV=production
VERCEL=1
```

**Как сгенерировать JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.3 Настроить Build Settings

В Vercel:
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Root Directory**: оставьте пустым

### 3.4 Deploy!

Нажмите **Deploy** и дождитесь завершения.

## Шаг 4: Проверка после деплоя

### 4.1 Проверить API

```bash
curl https://yourdomain.vercel.app/api/health
# Должно вернуть: {"ok":true}
```

### 4.2 Войти в админку

1. Откройте `https://yourdomain.vercel.app/admin`
2. Войдите с `admin@goodveen.com` / ваш_пароль
3. Проверьте что категории загружаются

### 4.3 Проверить загрузку изображений

1. Попробуйте создать продукт с изображением
2. Изображение должно загрузиться в Supabase Storage
3. URL должен быть вида: `https://hdqbwduzcakycshpihmp.supabase.co/storage/v1/object/public/uploads/products/...`

## Шаг 5: Настройка домена (опционально)

### 5.1 Добавить custom domain

1. В настройках Vercel проекта → **Domains**
2. Добавьте ваш домен (например, `goodveen.com`)
3. Настройте DNS записи как указано Vercel

### 5.2 Обновить CORS_ORIGINS

Добавьте новый домен в переменную окружения:
```env
CORS_ORIGINS=https://yourdomain.vercel.app,https://goodveen.com,https://www.goodveen.com
```

## Шаг 6: Мониторинг и логи

### Просмотр логов

1. Vercel Dashboard → ваш проект → **Logs**
2. Фильтруйте по типу: Functions, Build, Static
3. Ищите ошибки в Serverless Functions

### Мониторинг Supabase

1. https://supabase.com/dashboard/project/hdqbwduzcakycshpihmp/logs/explorer
2. Проверяйте SQL запросы и ошибки

## Troubleshooting

### Проблема: "Cannot find module '@supabase/supabase-js'"

**Решение:**
```bash
cd server
npm install @supabase/supabase-js
git add package.json package-lock.json
git commit -m "Add Supabase SDK"
git push
```

### Проблема: Изображения не загружаются

**Проверьте:**
1. Bucket `uploads` создан в Supabase Storage
2. Bucket публичный (Public)
3. `SUPABASE_SERVICE_ROLE_KEY` правильный
4. Политики доступа настроены

### Проблема: CORS ошибки

**Решение:**
Убедитесь что `CORS_ORIGINS` включает ваш домен Vercel:
```env
CORS_ORIGINS=https://your-project.vercel.app
```

### Проблема: Database connection failed

**Проверьте:**
1. `DATABASE_URL` правильный
2. Пароль БД корректный (без спецсимволов в URL)
3. Supabase проект активен

## Обновление продакшна

### Автоматический деплой

Vercel автоматически деплоит при push в `main`:
```bash
git add .
git commit -m "Update feature"
git push origin main
```

### Ручной деплой

1. Vercel Dashboard → ваш проект
2. **Deployments** → **Redeploy**

## Миграции БД

### Применить новую миграцию

```bash
# Локально создайте миграцию
cd server
npx prisma migrate dev --name add_new_feature

# Примените к Supabase через MCP
# Используйте Cascade MCP Supabase tools
```

Или вручную через SQL Editor:
1. https://supabase.com/dashboard/project/hdqbwduzcakycshpihmp/sql
2. Скопируйте SQL из `server/prisma/migrations/...`
3. Выполните

## Бэкапы

### Автоматические бэкапы Supabase

Supabase автоматически создает бэкапы (зависит от плана).

### Ручной бэкап

```bash
# Экспорт через Supabase Dashboard
# Settings → Database → Database backups
```

## Безопасность

### ✅ Что уже настроено:

- Rate limiting (200 req/min общий, 10 req/15min для auth)
- Helmet security headers
- CORS whitelist
- JWT authentication
- Admin-only endpoints
- Supabase RLS отключен (API работает через service role)

### 🔒 Рекомендации:

1. **Смените пароль админа** сразу после деплоя
2. **Используйте сильный JWT_SECRET** (минимум 32 символа)
3. **Ограничьте CORS** только вашими доменами
4. **Включите 2FA** в Supabase Dashboard
5. **Мониторьте логи** на подозрительную активность

## Стоимость

### Vercel (Hobby Plan - бесплатно):
- ✅ 100GB bandwidth
- ✅ Serverless Functions
- ✅ Автоматический SSL
- ✅ CDN

### Supabase (Free tier):
- ✅ 500MB database
- ✅ 1GB file storage
- ✅ 50,000 monthly active users
- ✅ 2GB bandwidth

**Итого: $0/месяц** для старта!

## Масштабирование

При росте трафика:
1. **Vercel Pro** ($20/мес) - больше bandwidth и функций
2. **Supabase Pro** ($25/мес) - больше storage и connections
3. **CDN для изображений** - Cloudflare Images или Vercel Image Optimization

## Полезные ссылки

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard/project/hdqbwduzcakycshpihmp
- **GitHub Repo**: https://github.com/Slowfingers/goodveen-2.0
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs

---

## 🎉 Готово!

Ваш сайт теперь в продакшне на современном стеке:
- ⚡ Быстрый (Vercel CDN)
- 🔒 Безопасный (JWT + Rate limiting)
- 📈 Масштабируемый (Serverless)
- 💰 Бесплатный (для старта)

Удачи! 🚀
