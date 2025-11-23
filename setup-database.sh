#!/bin/bash

echo "=== Настройка базы данных ==="
echo ""

echo "1. Применяем полную инициализацию базы данных..."
cat init-database.sql | docker compose exec -T postgres psql -U trello -d trello

echo ""
echo "2. Проверяем созданные таблицы..."
docker compose exec postgres psql -U trello -d trello -c "\dt"

echo ""
echo "3. Проверяем количество таблиц..."
docker compose exec postgres psql -U trello -d trello -c "SELECT COUNT(*) as table_count FROM pg_tables WHERE schemaname = 'public';"

echo ""
echo "=== База данных настроена! ==="
echo ""
echo "Теперь запустите backend напрямую (не через Docker):"
echo "cd backend"
echo "npm run dev"
