# Ручная настройка сервера CentOS 7

## Подключитесь к серверу и выполните все команды по порядку

```bash
ssh root@92.63.206.4
```

## Шаг 1: Подготовка системы

```bash
# Убиваем зависшие процессы yum
killall -9 yum 2>/dev/null || true
rm -f /var/run/yum.pid 2>/dev/null || true

# Исправляем репозитории CentOS 7 (так как CentOS 7 EOL)
sed -i 's/mirrorlist/#mirrorlist/g' /etc/yum.repos.d/CentOS-*
sed -i 's|#baseurl=http://mirror.centos.org|baseurl=http://vault.centos.org|g' /etc/yum.repos.d/CentOS-*

# Отключаем проблемные репозитории
yum-config-manager --disable pgdg12 pgdg13 pgdg14 2>/dev/null || true

# Очищаем кэш
yum clean all
```

## Шаг 2: Установка Node.js 20.x

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs
node --version  # Проверка
```

## Шаг 3: Установка PostgreSQL 15

```bash
yum install -y postgresql15-server postgresql15-contrib

# Инициализация
/usr/pgsql-15/bin/postgresql-15-setup initdb

# Запуск
systemctl start postgresql-15
systemctl enable postgresql-15
```

## Шаг 4: Настройка PostgreSQL

```bash
# Переключаемся на пользователя postgres
sudo -u postgres psql << 'EOF'
CREATE DATABASE goodveen;
CREATE USER goodveen_user WITH PASSWORD 'GoodveenPass2024!';
GRANT ALL PRIVILEGES ON DATABASE goodveen TO goodveen_user;
ALTER DATABASE goodveen OWNER TO goodveen_user;
\q
EOF
```

## Шаг 5: Установка Nginx

```bash
yum install -y nginx httpd-tools
systemctl start nginx
systemctl enable nginx
```

## Шаг 6: Установка PM2

```bash
npm install -g pm2
pm2 --version  # Проверка
```

## Шаг 7: Настройка Firewall

```bash
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload
```

## Шаг 8: Создание структуры проекта

```bash
mkdir -p /var/www/goodveen/server
cd /var/www/goodveen
```

## Шаг 9: Создание .env файла

```bash
cat > /var/www/goodveen/server/.env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://goodveen_user:GoodveenPass2024!@localhost:5432/goodveen"
JWT_SECRET="your_very_long_random_secret_key_min_32_characters_here_change_this"
ADMIN_EMAIL="admin@goodveen.com"
ADMIN_PASSWORD="admin123"
CORS_ORIGIN="*"
EOF

chmod 600 /var/www/goodveen/server/.env
```

## Шаг 10: Создание пароля для сайта

```bash
# Создайте пароль (введите когда попросит)
htpasswd -c /etc/nginx/.htpasswd admin
```

## Шаг 11: Настройка Nginx

```bash
cat > /etc/nginx/conf.d/goodveen.conf << 'EOF'
server {
    listen 80 default_server;
    server_name _;

    # Базовая аутентификация
    auth_basic "Goodveen Access";
    auth_basic_user_file /etc/nginx/.htpasswd;

    root /var/www/goodveen/dist;
    index index.html;

    client_max_body_size 10M;

    # API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads {
        alias /var/www/goodveen/server/uploads;
        expires 30d;
    }

    # Frontend
    location / {
        try_files $uri $uri/ /index.html;
    }
}
EOF

# Удаляем дефолтный конфиг
rm -f /etc/nginx/conf.d/default.conf

# Проверяем конфигурацию
nginx -t

# Перезапускаем Nginx
systemctl restart nginx
```

## Шаг 12: Создание PM2 конфигурации

```bash
cat > /var/www/goodveen/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'goodveen-api',
    cwd: '/var/www/goodveen/server',
    script: 'src/index.ts',
    interpreter: 'node',
    interpreter_args: '--import tsx',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
EOF
```

## ✅ Сервер настроен!

Теперь можно выйти из SSH и задеплоить приложение с локальной машины:

```bash
exit
```

На локальной машине выполните:

```bash
cd /Users/alexgsi/Code/goodveen
./deploy.sh
```

Или вручную:

```bash
# Собрать проект
npm run build

# Создать архив
tar -czf goodveen.tar.gz \
  --exclude=node_modules \
  --exclude=server/node_modules \
  --exclude=.git \
  dist/ server/ package.json index.html vite.config.ts tsconfig.json

# Загрузить на сервер
scp goodveen.tar.gz root@92.63.206.4:/tmp/

# На сервере распаковать и установить
ssh root@92.63.206.4

cd /var/www/goodveen
tar -xzf /tmp/goodveen.tar.gz
rm /tmp/goodveen.tar.gz

cd server
npm install --production
npx prisma generate
npx prisma migrate deploy

mkdir -p uploads/{products,events,pages,about,workshop}
chmod -R 755 uploads

cd /var/www/goodveen
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # выполните команду которую выведет

# Проверка
pm2 status
```

## Проверка работы

Откройте в браузере: `http://92.63.206.4`

Логин/пароль: те что создали через htpasswd (admin / ваш_пароль)
