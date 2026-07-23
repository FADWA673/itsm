#!/bin/bash
# backup.sh - Sauvegarde la base de données MySQL

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./database/backups"
mkdir -p "$BACKUP_DIR"

echo "💾 Sauvegarde de la base de données..."
docker exec itsm-db mysqldump -u root -p"$DB_ROOT_PASSWORD" itsm_db > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

echo "✅ Sauvegarde créée : $BACKUP_DIR/backup_$TIMESTAMP.sql"
