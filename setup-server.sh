#!/bin/bash

# Скрипт для первоначальной настройки сервера
# Использование: ./setup-server.sh

SERVER_IP="92.63.206.4"
SERVER_USER="root"

echo "🔧 Настройка сервера $SERVER_IP для Goodveen"
echo ""
echo "Этот скрипт установит:"
echo "  - Node.js 20.x"
echo "  - PostgreSQL"
echo "  - Nginx"
echo "  - PM2"
echo ""
read -p "Продолжить? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
fi

echo "📦 Подключаемся к серверу и устанавливаем ПО..."

ssh $SERVER_USER@$SERVER_IP << 'ENDSSH'
set -e

echo "🔄 Обновление системы..."
apt update
apt upgrade -y

echo "📦 Установка Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "📦 Установка PostgreSQL..."
apt install -y postgresql postgresql-contrib

echo "📦 Установка Nginx и утилит..."
apt install -y nginx apache2-utils

echo "📦 Установка PM2..."
npm install -g pm2

echo "✅ Проверка установки:"
node --version
npm --version
nginx -v
psql --version
pm2 --version

echo ""
echo "✅ Базовое ПО установлено!"
echo ""
echo "📋 Следующие шаги:"
echo "1. Настройте PostgreSQL базу данных"
echo "2. Создайте .env файл"
echo "3. Настройте Nginx"
echo ""

ENDSSH

echo ""
echo "✅ Сервер готов к настройке!"
echo ""
echo "Теперь выполните настройку вручную:"
echo "1. ssh root@$SERVER_IP"
echo "2. Следуйте инструкциям из QUICK_DEPLOY.md (шаги 3-6)"
