# 🐳 Docker Deployment Guide

## Преимущества Docker подхода

✅ **Всё в одном контейнере** - Frontend + Backend + Nginx  
✅ **Легко обновлять** - просто `docker-compose pull && docker-compose up -d`  
✅ **Изолированно** - не влияет на систему  
✅ **Работает везде** - на любом сервере с Docker  

---

## 📋 Требования

- Сервер с Ubuntu/Debian/CentOS
- Docker и Docker Compose установлены
- Порт 80 свободен (или используйте другой)

---

## 🚀 Быстрый старт

### 1. Установите Docker на сервере

```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Установите Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Перелогиньтесь
exit
```

### 2. Клонируйте репозиторий

```bash
git clone https://github.com/Slowfingers/goodveen-2.0.git
cd goodveen-2.0
```

### 3. Настройте переменные окружения

```bash
# Скопируйте и отредактируйте .env.production
cp .env.production .env

# Отредактируйте CORS_ORIGINS - добавьте IP вашего сервера
nano .env
```

Обновите:
```env
CORS_ORIGINS=http://YOUR_SERVER_IP,https://yourdomain.com
```

### 4. Соберите и запустите

```bash
# Сборка образа
docker-compose build

# Запуск
docker-compose up -d

# Проверка логов
docker-compose logs -f
```

### 5. Проверьте работу

```bash
# Health check
curl http://localhost/api/health

# Должно вернуть: {"ok":true}
```

Откройте в браузере: `http://YOUR_SERVER_IP`

---

## 🔄 Обновление приложения

```bash
cd goodveen-2.0

# Получить последние изменения
git pull

# Пересобрать и перезапустить
docker-compose build
docker-compose up -d

# Проверить логи
docker-compose logs -f app
```

---

## 🛠 Полезные команды

```bash
# Остановить
docker-compose down

# Перезапустить
docker-compose restart

# Посмотреть логи
docker-compose logs -f app

# Зайти внутрь контейнера
docker-compose exec app sh

# Очистить всё и начать заново
docker-compose down -v
docker system prune -a
```

---

## 🌐 Настройка домена (опционально)

### Вариант 1: Nginx на хосте (рекомендуется)

Если хотите HTTPS с Let's Encrypt:

```bash
# Установите Nginx на хост
sudo apt install nginx certbot python3-certbot-nginx

# Создайте конфиг
sudo nano /etc/nginx/sites-available/goodveen
```

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Активируйте конфиг
sudo ln -s /etc/nginx/sites-available/goodveen /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Получите SSL сертификат
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Вариант 2: Traefik (автоматический HTTPS)

Используйте `docker-compose.traefik.yml` (создам отдельно если нужно).

---

## 📊 Мониторинг

```bash
# Использование ресурсов
docker stats

# Проверка здоровья
docker-compose ps
```

---

## 🐛 Troubleshooting

### Порт 80 занят

Измените порт в `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # вместо 80:80
```

### Ошибки подключения к БД

Проверьте `DATABASE_URL` в `.env`:
```bash
docker-compose exec app sh
cd server
npx prisma db pull  # Проверит подключение
```

### Nginx не стартует

```bash
# Проверьте логи
docker-compose logs app

# Проверьте конфиг
docker-compose exec app nginx -t
```

---

## 🔐 Безопасность

1. **Firewall**: Откройте только порты 80 и 443
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

2. **Обновления**: Регулярно обновляйте образ
```bash
git pull
docker-compose build --no-cache
docker-compose up -d
```

3. **Бэкапы**: Настройте бэкап БД (Supabase делает автоматически)

---

## 💰 Стоимость

- **Сервер VPS**: от $5/месяц (DigitalOcean, Hetzner, Vultr)
- **Supabase**: $0/месяц (Free tier)
- **Домен**: ~$10/год

**Итого**: ~$5-10/месяц

---

## ✅ Готово!

Ваше приложение работает на:
- **Frontend**: http://YOUR_SERVER_IP
- **Backend API**: http://YOUR_SERVER_IP/api
- **Admin**: http://YOUR_SERVER_IP/admin

Логин: `admin@goodveen.com`  
Пароль: `Tashflora26#may`
