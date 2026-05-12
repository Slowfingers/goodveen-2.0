# Инструкция по деплою Goodveen на VPS сервер

## Информация о сервере
- **IP**: 92.63.206.4
- **Username**: root
- **OS**: Ubuntu/Debian (предполагается)

## Шаг 1: Подключение к серверу

```bash
ssh root@92.63.206.4
```

## Шаг 2: Установка необходимого ПО

```bash
# Обновляем систему
apt update && apt upgrade -y

# Устанавливаем Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Устанавливаем Nginx
apt install -y nginx

# Устанавливаем PM2 для управления процессами
npm install -g pm2

# Устанавливаем PostgreSQL
apt install -y postgresql postgresql-contrib

# Проверяем установку
node --version
npm --version
nginx -v
psql --version
```

## Шаг 3: Настройка PostgreSQL

```bash
# Переключаемся на пользователя postgres
sudo -u postgres psql

# В psql выполняем:
CREATE DATABASE goodveen;
CREATE USER goodveen_user WITH PASSWORD 'ваш_надежный_пароль';
GRANT ALL PRIVILEGES ON DATABASE goodveen TO goodveen_user;
\q
```

## Шаг 4: Подготовка проекта на сервере

```bash
# Создаем директорию для проекта
mkdir -p /var/www/goodveen
cd /var/www/goodveen

# Клонируем или загружаем проект
# Вариант 1: Если есть git репозиторий
# git clone <ваш_репозиторий> .

# Вариант 2: Загрузка через scp с локальной машины
# На локальной машине выполните:
# cd /Users/alexgsi/Code/goodveen
# tar -czf goodveen.tar.gz --exclude=node_modules --exclude=dist --exclude=server/node_modules .
# scp goodveen.tar.gz root@92.63.206.4:/var/www/goodveen/
# На сервере:
# tar -xzf goodveen.tar.gz
# rm goodveen.tar.gz
```

## Шаг 5: Настройка переменных окружения

```bash
cd /var/www/goodveen/server

# Создаем .env файл
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000

# PostgreSQL
DATABASE_URL="postgresql://goodveen_user:ваш_надежный_пароль@localhost:5432/goodveen"

# JWT Secret (сгенерируйте надежный ключ)
JWT_SECRET="ваш_очень_длинный_и_случайный_секретный_ключ"

# Admin credentials
ADMIN_EMAIL="admin@goodveen.com"
ADMIN_PASSWORD="ваш_админ_пароль"

# CORS
CORS_ORIGIN="https://ваш_домен.com"

# Email (если используется)
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your_email@example.com"
SMTP_PASS="your_password"
EMAIL_FROM="noreply@goodveen.com"
EOF

# Устанавливаем правильные права
chmod 600 .env
```

## Шаг 6: Установка зависимостей и сборка

```bash
# Устанавливаем зависимости фронтенда
cd /var/www/goodveen
npm install

# Устанавливаем зависимости бэкенда
cd server
npm install

# Генерируем Prisma Client
npx prisma generate

# Применяем миграции
npx prisma migrate deploy

# Создаем папки для загрузок
mkdir -p uploads/{products,events,pages,about,workshop}
chmod -R 755 uploads

# Возвращаемся в корень и собираем фронтенд
cd /var/www/goodveen
npm run build
```

## Шаг 7: Настройка PM2

```bash
cd /var/www/goodveen

# Создаем конфигурацию PM2
cat > ecosystem.config.js << 'EOF'
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

# Запускаем приложение
pm2 start ecosystem.config.js

# Сохраняем конфигурацию PM2
pm2 save

# Настраиваем автозапуск PM2 при перезагрузке
pm2 startup
# Выполните команду, которую выведет pm2 startup

# Проверяем статус
pm2 status
pm2 logs goodveen-api
```

## Шаг 8: Настройка Nginx

```bash
# Создаем конфигурацию Nginx
cat > /etc/nginx/sites-available/goodveen << 'EOF'
server {
    listen 80;
    server_name ваш_домен.com www.ваш_домен.com;

    # Базовая HTTP аутентификация для всего сайта
    auth_basic "Restricted Access";
    auth_basic_user_file /etc/nginx/.htpasswd;

    # Корневая директория для статических файлов
    root /var/www/goodveen/dist;
    index index.html;

    # Логи
    access_log /var/log/nginx/goodveen_access.log;
    error_log /var/log/nginx/goodveen_error.log;

    # Увеличиваем лимит размера загружаемых файлов
    client_max_body_size 10M;

    # API запросы проксируем на бэкенд
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Загруженные файлы
    location /uploads {
        alias /var/www/goodveen/server/uploads;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Статические файлы фронтенда
    location / {
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public";
    }

    # Кэширование статических ресурсов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Создаем файл с паролем для базовой аутентификации
# Замените 'your_username' и 'your_password' на свои значения
apt install -y apache2-utils
htpasswd -c /etc/nginx/.htpasswd your_username

# Активируем конфигурацию
ln -s /etc/nginx/sites-available/goodveen /etc/nginx/sites-enabled/

# Удаляем дефолтную конфигурацию
rm /etc/nginx/sites-enabled/default

# Проверяем конфигурацию
nginx -t

# Перезапускаем Nginx
systemctl restart nginx
systemctl enable nginx
```

## Шаг 9: Настройка SSL (опционально, но рекомендуется)

```bash
# Устанавливаем Certbot
apt install -y certbot python3-certbot-nginx

# Получаем SSL сертификат
certbot --nginx -d ваш_домен.com -d www.ваш_домен.com

# Certbot автоматически настроит HTTPS и перенаправление
```

## Шаг 10: Настройка Firewall

```bash
# Устанавливаем UFW
apt install -y ufw

# Разрешаем SSH, HTTP, HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'

# Включаем firewall
ufw enable

# Проверяем статус
ufw status
```

## Управление приложением

### Просмотр логов
```bash
# Логи PM2
pm2 logs goodveen-api

# Логи Nginx
tail -f /var/log/nginx/goodveen_access.log
tail -f /var/log/nginx/goodveen_error.log
```

### Перезапуск приложения
```bash
# Перезапуск бэкенда
pm2 restart goodveen-api

# Перезапуск Nginx
systemctl restart nginx
```

### Обновление приложения
```bash
cd /var/www/goodveen

# Загружаем новый код (git pull или scp)
# git pull

# Устанавливаем зависимости
npm install
cd server && npm install && cd ..

# Применяем миграции БД (если есть)
cd server && npx prisma migrate deploy && cd ..

# Собираем фронтенд
npm run build

# Перезапускаем бэкенд
pm2 restart goodveen-api

# Перезапускаем Nginx
systemctl restart nginx
```

## Важные заметки

1. **Пароль для сайта**: Базовая HTTP аутентификация настроена через Nginx (`.htpasswd`)
2. **Старый сайт**: Можно удалить через `rm -rf /var/www/old_site_directory`
3. **Бэкапы**: Настройте регулярные бэкапы базы данных:
   ```bash
   # Создание бэкапа
   pg_dump -U goodveen_user goodveen > backup_$(date +%Y%m%d).sql
   ```
4. **Мониторинг**: Используйте `pm2 monit` для мониторинга ресурсов

## Проверка работы

После деплоя проверьте:
- [ ] Сайт открывается по IP/домену
- [ ] Запрашивается пароль (базовая аутентификация)
- [ ] API работает (проверьте /api/health или любой endpoint)
- [ ] Загрузка изображений работает
- [ ] Админ-панель доступна
- [ ] База данных подключена
