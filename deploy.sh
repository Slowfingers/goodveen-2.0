#!/bin/bash

# Скрипт для деплоя Goodveen на VPS сервер
# Использование: ./deploy.sh

set -e

SERVER_IP="92.63.206.4"
SERVER_USER="root"
SERVER_PATH="/var/www/goodveen"
LOCAL_PATH="/Users/alexgsi/Code/goodveen"

echo "🚀 Начинаем деплой Goodveen на сервер $SERVER_IP"

# Проверяем что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: Запустите скрипт из корневой директории проекта"
    exit 1
fi

# Собираем фронтенд локально
echo "📦 Сборка фронтенда..."
npm run build

# Создаем архив для отправки
echo "📦 Создание архива..."
tar -czf goodveen-deploy.tar.gz \
    --exclude=node_modules \
    --exclude=server/node_modules \
    --exclude=server/uploads \
    --exclude=server/prisma/dev.db \
    --exclude=.git \
    --exclude=.DS_Store \
    dist/ \
    server/ \
    package.json \
    package-lock.json \
    vite.config.ts \
    tsconfig.json \
    index.html

echo "📤 Загрузка на сервер..."
scp goodveen-deploy.tar.gz $SERVER_USER@$SERVER_IP:/tmp/

echo "🔧 Установка на сервере..."
ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

# Создаем директорию если не существует
mkdir -p /var/www/goodveen
cd /var/www/goodveen

# Создаем бэкап текущей версии
if [ -d "dist" ]; then
    echo "💾 Создание бэкапа..."
    tar -czf backup-$(date +%Y%m%d-%H%M%S).tar.gz dist/ server/ || true
fi

# Распаковываем новую версию
echo "📦 Распаковка новой версии..."
tar -xzf /tmp/goodveen-deploy.tar.gz
rm /tmp/goodveen-deploy.tar.gz

# Устанавливаем зависимости бэкенда
echo "📦 Установка зависимостей бэкенда..."
cd server
npm install --production

# Генерируем Prisma Client
echo "🔧 Генерация Prisma Client..."
npx prisma generate

# Применяем миграции
echo "🗄️ Применение миграций БД..."
npx prisma migrate deploy || echo "⚠️ Миграции не применены (возможно, нет изменений)"

# Создаем папки для загрузок если не существуют
mkdir -p uploads/{products,events,pages,about,workshop}
chmod -R 755 uploads

# Перезапускаем приложение через PM2
echo "🔄 Перезапуск приложения..."
if pm2 list | grep -q "goodveen-api"; then
    pm2 restart goodveen-api
else
    echo "⚠️ PM2 процесс не найден. Запустите вручную: pm2 start ecosystem.config.js"
fi

# Перезапускаем Nginx
echo "🔄 Перезапуск Nginx..."
systemctl restart nginx

echo "✅ Деплой завершен!"
echo "📊 Статус приложения:"
pm2 status

ENDSSH

# Удаляем локальный архив
rm goodveen-deploy.tar.gz

echo ""
echo "✅ Деплой успешно завершен!"
echo "🌐 Проверьте сайт: http://$SERVER_IP"
echo "📊 Логи: ssh $SERVER_USER@$SERVER_IP 'pm2 logs goodveen-api'"
