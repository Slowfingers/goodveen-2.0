# 🌸 Goodveen - Flower Shop Platform

Современная платформа для цветочного магазина с админ-панелью, каталогом, корзиной и системой заказов.

## 🚀 Быстрый старт

### Локальная разработка

```bash
# Установите зависимости
npm install
cd server && npm install && cd ..

# Настройте базу данных (см. SUPABASE_SETUP.md)
cd server
cp .env.example .env
# Отредактируйте .env с вашими данными Supabase
npx prisma generate
cd ..

# Запустите dev сервер (frontend + backend)
npm run dev
```

Откройте:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Admin**: http://localhost:3000/admin

### 🐳 Production деплой (Docker)

**Рекомендуемый способ** - см. [DOCKER_DEPLOY.md](./DOCKER_DEPLOY.md)

```bash
# На вашем сервере
git clone https://github.com/Slowfingers/goodveen-2.0.git
cd goodveen-2.0
cp .env.production .env
# Отредактируйте .env
docker-compose up -d
```

---

## 📁 Структура проекта

```
goodveen/
├── src/                    # Frontend (React + Vite)
│   ├── pages/             # Страницы
│   ├── components/        # Компоненты
│   ├── lib/               # API клиент, утилиты
│   └── admin/             # Админ-панель
├── server/                # Backend (Express + Prisma)
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── lib/          # Auth, storage, utils
│   │   └── index.ts      # Express app
│   └── prisma/
│       └── schema.prisma # Database schema
├── docker/                # Docker конфигурация
├── Dockerfile            # Production образ
└── docker-compose.yml    # Orchestration
```

---

## 🛠 Технологии

### Frontend
- **React 19** - UI библиотека
- **Vite** - Build tool
- **TailwindCSS 4** - Стилизация
- **React Router 7** - Роутинг
- **Lucide React** - Иконки
- **Motion** - Анимации

### Backend
- **Node.js + Express** - API сервер
- **Prisma ORM** - Database ORM
- **PostgreSQL** (Supabase) - База данных
- **JWT** - Аутентификация
- **Zod** - Валидация
- **Multer** - Загрузка файлов

### DevOps
- **Docker** - Контейнеризация
- **Nginx** - Reverse proxy
- **Supabase** - Database + Storage

---

## 📚 Документация

- [🐳 Docker Deployment](./DOCKER_DEPLOY.md) - Деплой на свой сервер
- [🗄️ Supabase Setup](./SUPABASE_SETUP.md) - Настройка базы данных
- [📧 Email Setup](./server/EMAIL_SETUP.md) - Настройка email уведомлений
- [🧪 Testing Guide](./TESTING_GUIDE.md) - Тестирование
- [📝 Changelog](./CHANGELOG.md) - История изменений

---

## 🔑 Основные функции

### Для клиентов
- 🌸 Каталог товаров с фильтрацией
- 🛒 Корзина покупок
- 📦 Оформление заказов
- 🎉 События и мастер-классы
- 📱 Адаптивный дизайн

### Для администратора
- 📊 Управление товарами
- 📂 Управление категориями
- 🎨 Управление событиями
- 📦 Управление заказами
- 👥 Управление пользователями
- 🎨 Настройка страниц (О нас, Мастерская)
- 🎨 Фильтры (цвета, типы цветов)

---

## 🔐 Безопасность

- JWT токены для аутентификации
- Bcrypt для хеширования паролей
- CORS защита
- Rate limiting
- Helmet.js для HTTP headers
- Валидация всех входных данных (Zod)

---

## 🌍 Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001  # URL бэкенда
```

### Backend (server/.env)
```env
DATABASE_URL=postgresql://...       # Supabase PostgreSQL
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@goodveen.com
ADMIN_PASSWORD=your-password
SUPABASE_URL=https://...
SUPABASE_SERVICE_ROLE_KEY=...
CORS_ORIGINS=http://localhost:3000
NODE_ENV=development
PORT=3001
```

См. `.env.production` для production конфигурации.

---

## 📦 Скрипты

```bash
# Разработка
npm run dev              # Frontend + Backend
npm run dev:web          # Только frontend
npm run dev:api          # Только backend

# Сборка
npm run build            # Собрать frontend

# Docker
npm run docker:build     # Собрать Docker образ
npm run docker:up        # Запустить контейнер
npm run docker:down      # Остановить контейнер
npm run docker:logs      # Посмотреть логи

# Server
npm run server:install   # Установить зависимости сервера
npm run server:prisma    # Сгенерировать Prisma Client
npm run server:migrate   # Применить миграции
npm run server:seed      # Заполнить БД тестовыми данными
npm run server:studio    # Открыть Prisma Studio
```

---

## 🤝 Contributing

1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

---

## 📄 License

MIT License - см. [LICENSE](./LICENSE)

---

## 👨‍💻 Автор

**Goodveen Team**

- GitHub: [@Slowfingers](https://github.com/Slowfingers)
- Email: tashflora@gmail.com

---

## 🙏 Благодарности

- [Supabase](https://supabase.com) - Database & Storage
- [Vercel](https://vercel.com) - Inspiration
- [React](https://react.dev) - UI Framework
- [TailwindCSS](https://tailwindcss.com) - Styling

---

**Сделано с ❤️ для цветочного бизнеса**
