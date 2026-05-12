# Быстрый деплой на сервер

## Подготовка сервера (один раз)

### 1. Подключитесь к серверу
```bash
ssh root@92.63.206.4
```

### 2. Установите необходимое ПО
```bash
# Обновление системы
apt update && apt upgrade -y

# Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Nginx, PostgreSQL, утилиты
apt install -y nginx postgresql postgresql-contrib apache2-utils

# PM2
npm install -g pm2

# Проверка
node --version  # должно быть v20.x
```

### 3. Настройте PostgreSQL
```bash
sudo -u postgres psql
```

В psql выполните:
```sql
CREATE DATABASE goodveen;
CREATE USER goodveen_user WITH PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE goodveen TO goodveen_user;
ALTER DATABASE goodveen OWNER TO goodveen_user;
\q
```

### 4. Создайте .env файл для бэкенда
```bash
mkdir -p /var/www/goodveen/server
nano /var/www/goodveen/server/.env
```

Вставьте:
```env
NODE_ENV=production
PORT=5000
DATABASE_URL="postgresql://goodveen_user:your_secure_password_here@localhost:5432/goodveen"
JWT_SECRET="your_very_long_random_secret_key_here_min_32_chars"
ADMIN_EMAIL="admin@goodveen.com"
ADMIN_PASSWORD="your_admin_password"
CORS_ORIGIN="*"
```

Сохраните (Ctrl+O, Enter, Ctrl+X) и установите права:
```bash
chmod 600 /var/www/goodveen/server/.env
```

### 5. Настройте Nginx с паролем
```bash
# Создайте пароль для сайта (замените username и введите пароль)
htpasswd -c /etc/nginx/.htpasswd username

# Создайте конфигурацию Nginx
nano /etc/nginx/sites-available/goodveen
```

Вставьте:
```nginx
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
```

Активируйте:
```bash
rm /etc/nginx/sites-enabled/default
ln -s /etc/nginx/sites-available/goodveen /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
systemctl enable nginx
```

### 6. Создайте PM2 конфигурацию
```bash
nano /var/www/goodveen/ecosystem.config.js
```

Вставьте:
```javascript
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
```

### 7. Настройте Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
```

## Деплой приложения

### С локальной машины:

```bash
cd /Users/alexgsi/Code/goodveen
./deploy.sh
```

### Или вручную:

1. **Соберите проект локально:**
```bash
cd /Users/alexgsi/Code/goodveen
npm run build
```

2. **Создайте архив:**
```bash
tar -czf goodveen.tar.gz \
  --exclude=node_modules \
  --exclude=server/node_modules \
  --exclude=.git \
  dist/ server/ package.json index.html vite.config.ts tsconfig.json
```

3. **Загрузите на сервер:**
```bash
scp goodveen.tar.gz root@92.63.206.4:/tmp/
```

4. **На сервере распакуйте и установите:**
```bash
ssh root@92.63.206.4

cd /var/www/goodveen
tar -xzf /tmp/goodveen.tar.gz
rm /tmp/goodveen.tar.gz

# Установка зависимостей
cd server
npm install --production
npx prisma generate
npx prisma migrate deploy

# Создание папок
mkdir -p uploads/{products,events,pages,about,workshop}
chmod -R 755 uploads

# Запуск/перезапуск
cd /var/www/goodveen
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # выполните команду которую выведет
```

## Проверка

1. Откройте в браузере: `http://92.63.206.4`
2. Введите логин/пароль который создали через htpasswd
3. Проверьте что сайт работает
4. Проверьте админ-панель: `http://92.63.206.4/admin`

## Полезные команды

```bash
# Логи приложения
pm2 logs goodveen-api

# Статус
pm2 status

# Перезапуск
pm2 restart goodveen-api

# Логи Nginx
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Бэкап БД
pg_dump -U goodveen_user goodveen > backup.sql

# Восстановление БД
psql -U goodveen_user goodveen < backup.sql
```

## Удаление старого сайта

Если на сервере есть старый сайт, удалите его:
```bash
# Найдите старые директории
ls -la /var/www/

# Удалите (замените old_site на реальное имя)
rm -rf /var/www/old_site

# Удалите старые конфигурации Nginx
ls /etc/nginx/sites-available/
rm /etc/nginx/sites-available/old_config
rm /etc/nginx/sites-enabled/old_config

# Остановите старые PM2 процессы
pm2 list
pm2 delete old_process_name
```
