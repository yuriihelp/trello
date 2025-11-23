#!/bin/bash

echo "=== Запуск Task Board ==="
echo ""

# Шаг 1: Запуск сервисов
echo "1. Запускаем Docker сервисы..."
docker compose up -d

# Ждем запуска PostgreSQL
echo "2. Ждем запуска PostgreSQL (10 секунд)..."
sleep 10

# Шаг 2: Применяем миграцию
echo "3. Применяем миграции базы данных..."
docker compose exec backend sh -c "npx prisma migrate deploy" || \
docker compose exec backend sh -c "PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate && npx prisma migrate deploy"

# Если не получилось через Prisma, применим SQL напрямую
if [ $? -ne 0 ]; then
    echo "Применяем миграцию через SQL..."
    docker compose exec postgres psql -U trello -d trello -f /app/migrations/001_add_users.sql
fi

# Шаг 3: Проверяем статус
echo ""
echo "4. Проверяем статус сервисов..."
docker compose ps

echo ""
echo "=== Готово! ==="
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:3001"
echo ""
echo "Проверьте здоровье API:"
echo "curl http://localhost:3001/health"
