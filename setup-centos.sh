#!/bin/bash

# Полная настройка CentOS 7 сервера для Goodveen
# Выполняется на сервере одной командой

set -e

echo "🔧 Настройка CentOS 7 для Goodveen"

# Убиваем зависшие процессы yum
echo "🔄 Очистка заблокированных процессов..."
killall -9 yum 2>/dev/null || true
rm -f /var/run/yum.pid 2>/dev/null || true

# Исправляем репозитории CentOS 7
echo "📦 Исправление репозиториев CentOS 7..."
sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-*
sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-*

# Отключаем проблемные репозитории PostgreSQL
echo "🔧 Отключение старых репозиториев..."
yum-config-manager --disable pgdg12 pgdg13 pgdg14 2>/dev/null || true

# Очищаем кэш
yum clean all

# Устанавливаем Node.js 20.x
echo "📦 Установка Node.js 20.x..."
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# Устанавливаем PostgreSQL 15
echo "📦 Установка PostgreSQL 15..."
yum install -y postgresql15-server postgresql15-contrib

# Инициализируем PostgreSQL
echo "🔧 Инициализация PostgreSQL..."
/usr/pgsql-15/bin/postgresql-15-setup initdb || echo "PostgreSQL уже инициализирован"
systemctl start postgresql-15
systemctl enable postgresql-15

# Устанавливаем Nginx
echo "📦 Установка Nginx..."
yum install -y nginx httpd-tools

# Запускаем и включаем Nginx
systemctl start nginx
systemctl enable nginx

# Устанавливаем PM2
echo "📦 Установка PM2..."
npm install -g pm2

# Настраиваем firewall
echo "🔥 Настройка firewall..."
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

echo ""
echo "✅ Базовое ПО установлено!"
echo ""
node --version
npm --version
nginx -v
/usr/pgsql-15/bin/psql --version
pm2 --version

echo ""
echo "📋 Следующие шаги:"
echo "1. Настроить PostgreSQL базу данных"
echo "2. Создать .env файл"
echo "3. Настроить Nginx конфигурацию"
echo "4. Задеплоить приложение"
