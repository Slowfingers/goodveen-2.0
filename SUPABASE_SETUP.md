# Supabase Database Setup — Завершено! ✅

## Что было создано

### 📊 Все таблицы базы данных:
- ✅ **users** (1 запись — админ)
- ✅ **password_reset_tokens**
- ✅ **addresses**
- ✅ **categories** (1 тестовая категория "Букеты")
- ✅ **products**
- ✅ **product_sizes**
- ✅ **product_images**
- ✅ **cart_items**
- ✅ **orders**
- ✅ **order_items**
- ✅ **payments**
- ✅ **payment_logs**
- ✅ **events**
- ✅ **about_page** (1 запись с пустыми массивами)
- ✅ **filter_colors** (8 цветов: белый, красный, розовый, жёлтый, оранжевый, фиолетовый, синий, зелёный)
- ✅ **filter_flower_types** (8 типов: розы, пионы, тюльпаны, гортензии, хризантемы, лилии, орхидеи, эустомы)
- ✅ **page_settings**
- ✅ **contact_settings** (1 запись с дефолтными данными)

### 🔐 Админ создан:
- **Email:** `admin@goodveen.com`
- **Пароль:** `admin12345`
- **Роль:** ADMIN

---

## 🚀 Как подключить сервер к Supabase

### 1. Получите пароль от базы данных:
1. Откройте https://supabase.com/dashboard/project/hdqbwduzcakycshpihmp/settings/database
2. Скопируйте пароль из раздела **Database password** (или сбросьте его если забыли)

### 2. Обновите `/server/.env`:

```env
# Замените SQLite на PostgreSQL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.hdqbwduzcakycshpihmp.supabase.co:5432/postgres"

JWT_SECRET="dev-only-secret-change-me"
PORT=3001
PUBLIC_BASE_URL="http://localhost:3001"
ADMIN_EMAIL="admin@goodveen.com"
ADMIN_PASSWORD="admin12345"

# Для production добавьте:
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
```

**Замените `[YOUR-PASSWORD]` на реальный пароль из Supabase!**

### 3. Обновите Prisma схему:

Откройте `/server/prisma/schema.prisma` и измените:

```prisma
datasource db {
  provider = "postgresql"  // было: "sqlite"
  url      = env("DATABASE_URL")
}
```

### 4. Сгенерируйте Prisma Client:

```bash
cd server
npx prisma generate
```

### 5. Запустите сервер:

```bash
npm run dev
```

---

## ⚠️ ВАЖНО: Row Level Security (RLS)

**Все таблицы созданы БЕЗ RLS** — это нормально для backend API, который работает через сервер.

Если вы планируете использовать Supabase Client напрямую из фронтенда (не рекомендуется для вашей архитектуры), нужно будет включить RLS и настроить политики.

Для текущей архитектуры (Express API → Supabase) RLS не требуется, так как все запросы идут через ваш защищённый backend.

---

## 🧪 Проверка подключения

После настройки `.env` и перезапуска сервера:

1. Откройте http://localhost:3001/admin
2. Войдите с `admin@goodveen.com` / `admin12345`
3. Проверьте что категория "Букеты" отображается
4. Попробуйте создать продукт

---

## 📝 Следующие шаги

1. **Смените пароль админа** через админку (Личный кабинет → Смена пароля)
2. **Добавьте реальные категории** через `/admin/categories`
3. **Загрузите продукты** через `/admin/products`
4. **Настройте контакты** через `/admin/contact`
5. **Обновите обложки страниц** через `/admin/pages`

---

## 🔗 Полезные ссылки

- **Supabase Dashboard:** https://supabase.com/dashboard/project/hdqbwduzcakycshpihmp
- **Database:** https://supabase.com/dashboard/project/hdqbwduzcakycshpihmp/editor
- **SQL Editor:** https://supabase.com/dashboard/project/hdqbwduzcakycshpihmp/sql
- **API Settings:** https://supabase.com/dashboard/project/hdqbwduzcakycshpihmp/settings/api

---

## 🛠 Миграции созданы:

1. `create_core_tables` — users, password_reset_tokens, addresses
2. `create_catalog_tables` — categories, products, product_sizes, product_images
3. `create_cart_and_orders` — cart_items, orders, order_items
4. `create_payments_and_events` — payments, payment_logs, events
5. `create_settings_and_filters` — about_page, filter_colors, filter_flower_types, page_settings, contact_settings
6. `add_updated_at_triggers` — автоматическое обновление updated_at
7. `seed_initial_data` — начальные данные (настройки, фильтры, админ)
