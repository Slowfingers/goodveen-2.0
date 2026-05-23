#!/bin/bash
# Скрипт для бэкапа PostgreSQL базы данных

set -e

BACKUP_DIR="/opt/goodveen/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/goodveen_backup_$TIMESTAMP.sql"

# Создаем директорию для бэкапов
mkdir -p "$BACKUP_DIR"

echo "🔄 Creating database backup..."

# Создаем бэкап
docker exec goodveen-db pg_dump -U goodveen goodveen > "$BACKUP_FILE"

# Сжимаем бэкап
gzip "$BACKUP_FILE"

echo "✅ Backup created: ${BACKUP_FILE}.gz"

# Удаляем бэкапы старше 7 дней
find "$BACKUP_DIR" -name "goodveen_backup_*.sql.gz" -mtime +7 -delete

echo "🧹 Old backups cleaned up"
