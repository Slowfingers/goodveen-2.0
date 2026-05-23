# 🚀 Простой деплой: Vercel (Frontend) + Railway (Backend)

## Проблема с Vercel Serverless

Vercel Serverless Functions имеют ограничения:
- Не поддерживают полноценный Express сервер
- Требуют переписывания всего API
- Ограничения по времени выполнения

## ✅ Простое решение

**Frontend → Vercel** (бесплатно)  
**Backend → Railway** (бесплатно $5/месяц кредитов)

---

## Шаг 1: Deploy Backend на Railway

### 1.1 Создать аккаунт на Railway
1. Зайдите на https://railway.app
2. Sign up через GitHub

### 1.2 Deploy из GitHub
1. New Project → Deploy from GitHub repo
2. Выберите `Slowfingers/goodveen-2.0`
3. Railway автоматически определит Node.js проект

### 1.3 Настроить Root Directory
1. Settings → Root Directory → `/server`
2. Build Command: `npm install && npx prisma generate`
3. Start Command: `npm start`

### 1.4 Добавить Environment Variables

```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.hdqbwduzcakycshpihmp.supabase.co:5432/postgres
SUPABASE_URL=https://hdqbwduzcakycshpihmp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR_KEY]
JWT_SECRET=[GENERATE_32_CHARS]
ADMIN_EMAIL=admin@goodveen.com
ADMIN_PASSWORD=[YOUR_PASSWORD]
CORS_ORIGINS=https://goodveen.vercel.app
NODE_ENV=production
PORT=3001
```

### 1.5 Deploy!
Railway автоматически задеплоит и даст вам URL вида:
```
https://goodveen-production.up.railway.app
```

---

## Шаг 2: Настроить Vercel для использования Railway API

### 2.1 Добавить переменную окружения в Vercel

1. Vercel Dashboard → goodveen → Settings → Environment Variables
2. Добавить:
```
VITE_API_URL=https://goodveen-production.up.railway.app
```

### 2.2 Redeploy Vercel
```bash
npx vercel --prod
```

---

## Шаг 3: Обновить CORS на Railway

После деплоя Vercel, обновите `CORS_ORIGINS` на Railway:
```env
CORS_ORIGINS=https://goodveen.vercel.app,https://goodveen-production.up.railway.app
```

---

## ✅ Готово!

Теперь у вас:
- **Frontend**: https://goodveen.vercel.app
- **Backend**: https://goodveen-production.up.railway.app

---

## Стоимость

- **Vercel**: $0/месяц (Hobby plan)
- **Railway**: $5/месяц в кредитах (бесплатно для старта)
- **Supabase**: $0/месяц (Free tier)

**Итого**: $0/месяц первые месяцы!

---

## Альтернатива: Render.com

Если Railway не подходит, можно использовать Render.com:

1. https://render.com → New Web Service
2. Connect GitHub repo
3. Root Directory: `server`
4. Build Command: `npm install && npx prisma generate`
5. Start Command: `npm start`
6. Добавить те же Environment Variables

Render дает бесплатный tier (с ограничениями по CPU).

---

## Troubleshooting

### Backend не запускается на Railway

Проверьте логи:
1. Railway Dashboard → Deployments → View Logs
2. Ищите ошибки подключения к БД или missing env vars

### CORS ошибки

Убедитесь что `CORS_ORIGINS` на Railway включает:
```
https://goodveen.vercel.app
```

### API запросы возвращают 404

Проверьте что `VITE_API_URL` в Vercel правильный и включает `https://`
