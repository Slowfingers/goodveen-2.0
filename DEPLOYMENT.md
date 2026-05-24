# 🚀 Deployment Guide - Goodveen

## 📋 Обзор

Goodveen развернут на самостоятельном сервере с использованием Docker Compose.

**Архитектура:**
- **Frontend**: React + Vite (собирается в статику, раздается через Nginx)
- **Backend**: Node.js + Express + Prisma ORM
- **Database**: PostgreSQL 16 (локальный контейнер)
- **Web Server**: Nginx (внутри app контейнера)

## 🏗️ Структура

```
goodveen/
├── docker-compose.yml          # Production setup
├── docker-compose.dev.yml      # Development setup с hot reload
├── Dockerfile                  # Multi-stage build
├── docker/
│   ├── nginx.conf             # Nginx конфигурация
│   ├── start.sh               # Startup script
│   ├── init-db.sh             # DB initialization
│   └── backup-db.sh           # Backup script
├── .env.production            # Production env template
└── server/prisma/migrations/  # Database migrations
```

## 🔧 Первоначальная настройка

### 1. Подготовка сервера

```bash
# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Клонирование репозитория
cd /opt
git clone https://github.com/Slowfingers/goodveen-2.0.git goodveen
cd goodveen
```

### 2. Настройка переменных окружения

```bash
# Создайте .env файл на основе .env.production
cp .env.production .env

# Отредактируйте .env:
nano .env
```

**Обязательные переменные:**
```env
DB_PASSWORD=your_secure_db_password
JWT_SECRET=your_jwt_secret_key
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_admin_password
CORS_ORIGINS=http://your-server-ip
```

### 3. Первый запуск

```bash
# Сборка и запуск
docker-compose up -d

# Ожидание готовности БД
sleep 20

# Применение миграций
docker-compose exec -T app sh -c 'cd /app/server && npx prisma migrate deploy'

# Создание начальных данных
docker-compose exec -T app sh -c 'cd /app/server && npx tsx src/seed.ts'

# Проверка
curl http://localhost/api/health
```

## 🔄 Обновление приложения

```bash
cd /opt/goodveen

# Получение последних изменений
git pull

# Пересборка и перезапуск
docker-compose down
docker-compose build
docker-compose up -d

# Применение новых миграций (если есть)
docker-compose exec -T app sh -c 'cd /app/server && npx prisma migrate deploy'
```

## 💾 Бэкапы

### Автоматический бэкап

```bash
# Сделать бэкап вручную
chmod +x docker/backup-db.sh
./docker/backup-db.sh

# Настроить автоматический бэкап (cron)
crontab -e

# Добавить строку (бэкап каждый день в 3:00)
0 3 * * * /opt/goodveen/docker/backup-db.sh
```

### Восстановление из бэкапа

```bash
# Восстановление
gunzip < /opt/goodveen/backups/goodveen_backup_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i goodveen-db psql -U goodveen -d goodveen
```

## 🔍 Мониторинг

### Проверка статуса

```bash
# Статус контейнеров
docker-compose ps

# Логи приложения
docker-compose logs -f app

# Логи БД
docker-compose logs -f db

# Размер БД
docker exec goodveen-db psql -U goodveen -d goodveen -c \
  "SELECT pg_size_pretty(pg_database_size('goodveen'));"
```

### Health checks

- **API Health**: `http://your-server/api/health`
- **Categories**: `http://your-server/api/categories`
- **Frontend**: `http://your-server/`

## 🛠️ Разработка

### Локальная разработка с hot reload

```bash
# Использовать dev конфигурацию
docker-compose -f docker-compose.dev.yml up

# Frontend будет доступен на http://localhost:5173
# Backend API на http://localhost:3001
# Nginx proxy на http://localhost:80
```

### Применение изменений в схеме БД

```bash
# Создать новую миграцию
docker-compose exec app sh -c 'cd /app/server && npx prisma migrate dev --name your_migration_name'

# Применить миграции на production
docker-compose exec app sh -c 'cd /app/server && npx prisma migrate deploy'
```

## 🔒 Безопасность

### Рекомендации

1. **Используйте сильные пароли** для DB_PASSWORD и ADMIN_PASSWORD
2. **Храните .env в безопасности** - никогда не коммитьте в Git
3. **Регулярные бэкапы** - настройте автоматические бэкапы
4. **Обновления** - регулярно обновляйте зависимости
5. **HTTPS** - настройте SSL сертификат (Let's Encrypt)
6. **Firewall** - закройте ненужные порты

### Настройка SSL (опционально)

```bash
# Установка Certbot
sudo apt install certbot

# Получение сертификата
sudo certbot certonly --standalone -d yourdomain.com

# Обновление nginx.conf для использования SSL
# Перезапуск
docker-compose restart app
```

## 📊 Оптимизация

### Очистка Docker

```bash
# Удаление неиспользуемых образов и контейнеров
docker system prune -f

# Полная очистка (осторожно!)
docker system prune -af --volumes
```

### Мониторинг дискового пространства

```bash
# Проверка использования диска
df -h /

# Размер Docker
docker system df

# Размер БД
docker exec goodveen-db psql -U goodveen -d goodveen -c \
  "SELECT pg_size_pretty(pg_database_size('goodveen'));"
```

## 🐛 Troubleshooting

### Проблема: "no space left on device"

```bash
# Очистка Docker
docker system prune -af --volumes

# Проверка места
df -h /
```

### Проблема: Контейнер не запускается

```bash
# Проверка логов
docker-compose logs app

# Перезапуск
docker-compose down
docker-compose up -d
```

### Проблема: БД не подключается

```bash
# Проверка статуса БД
docker-compose ps db

# Проверка логов БД
docker-compose logs db

# Проверка подключения
docker exec goodveen-db psql -U goodveen -d goodveen -c "SELECT 1;"
```

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи: `docker-compose logs`
2. Проверьте статус: `docker-compose ps`
3. Проверьте переменные окружения в `.env`
4. Создайте issue в GitHub репозитории

## 🎯 Полезные команды

```bash
# Перезапуск приложения
docker-compose restart app

# Перезапуск БД
docker-compose restart db

# Просмотр логов в реальном времени
docker-compose logs -f

# Выполнение команд внутри контейнера
docker-compose exec app sh

# Подключение к БД
docker exec -it goodveen-db psql -U goodveen -d goodveen

# Просмотр таблиц БД
docker exec goodveen-db psql -U goodveen -d goodveen -c "\dt"
```

---

**Версия**: 2.0  
**Последнее обновление**: 24 мая 2026  
**Статус**: ✅ Production Ready
