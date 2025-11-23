#!/bin/bash

echo "=== Запуск Task Board ==="
echo ""

# Шаг 1: Запуск PostgreSQL
echo "1. Запускаем PostgreSQL через Docker..."
docker compose up -d postgres

# Ждем запуска PostgreSQL
echo "2. Ждем запуска PostgreSQL (5 секунд)..."
sleep 5

# Шаг 2: Проверяем и инициализируем базу данных
echo "3. Проверяем наличие таблиц в базе данных..."
TABLE_COUNT=$(docker compose exec -T postgres psql -U trello -d trello -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';" 2>/dev/null | tr -d ' ')

if [ "$TABLE_COUNT" -lt "11" ]; then
    echo "   База данных пуста или неполная. Применяем полную инициализацию..."
    cat init-database.sql | docker compose exec -T postgres psql -U trello -d trello

    if [ $? -eq 0 ]; then
        echo "   ✓ База данных инициализирована успешно!"
    else
        echo "   ✗ Ошибка инициализации базы данных"
        exit 1
    fi
else
    echo "   ✓ База данных уже инициализирована ($TABLE_COUNT таблиц)"
fi

# Шаг 3: Проверяем статус PostgreSQL
echo ""
echo "4. Проверяем статус PostgreSQL..."
docker compose ps postgres

echo ""
echo "=== PostgreSQL готов! ==="
echo ""
echo "Теперь запустите Backend и Frontend вручную:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  npm install  # если еще не установлено"
echo "  npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm install  # если еще не установлено"
echo "  npm run dev"
echo ""
echo "После запуска откройте: http://localhost:3000"
echo ""
echo "Примечание: Backend запускается локально (не в Docker) из-за проблем с Prisma/OpenSSL"
