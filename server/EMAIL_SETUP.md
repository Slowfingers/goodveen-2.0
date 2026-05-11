# Настройка отправки Email

## Для разработки

В режиме разработки, если SMTP не настроен, ссылки для восстановления пароля будут выводиться в консоль сервера.

## Настройка Gmail SMTP

1. Войдите в свой Gmail аккаунт
2. Перейдите в настройки безопасности: https://myaccount.google.com/security
3. Включите двухфакторную аутентификацию (если ещё не включена)
4. Создайте пароль приложения:
   - Перейдите в "Пароли приложений": https://myaccount.google.com/apppasswords
   - Выберите "Почта" и "Другое устройство"
   - Введите название (например, "Goodveen Server")
   - Скопируйте сгенерированный пароль

5. Добавьте в `.env` файл:
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-16-char-app-password"
```

## Другие SMTP провайдеры

### Yandex Mail
```env
SMTP_HOST="smtp.yandex.ru"
SMTP_PORT=465
SMTP_USER="your-email@yandex.ru"
SMTP_PASS="your-password"
```

### Mail.ru
```env
SMTP_HOST="smtp.mail.ru"
SMTP_PORT=465
SMTP_USER="your-email@mail.ru"
SMTP_PASS="your-password"
```

### SendGrid (рекомендуется для production)
```env
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT=587
SMTP_USER="apikey"
SMTP_PASS="your-sendgrid-api-key"
```

## Проверка работы

1. Запустите сервер
2. Попробуйте восстановить пароль через форму на сайте
3. Проверьте:
   - Если SMTP настроен - письмо придёт на почту
   - Если SMTP не настроен - ссылка появится в консоли сервера

## Troubleshooting

### Письма не приходят
- Проверьте папку "Спам"
- Убедитесь, что SMTP_USER и SMTP_PASS правильные
- Проверьте логи сервера на наличие ошибок
- Для Gmail убедитесь, что используете пароль приложения, а не обычный пароль

### Ошибка "Invalid login"
- Для Gmail: используйте пароль приложения
- Для других провайдеров: проверьте, что разрешена авторизация через SMTP

### Ошибка подключения
- Проверьте SMTP_HOST и SMTP_PORT
- Убедитесь, что нет блокировки файрволом
