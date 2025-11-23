#!/bin/bash

echo "=== Применение миграции базы данных ==="
echo ""

# Проверяем, запущен ли backend контейнер
if docker compose ps backend | grep -q "Up"; then
    echo "Применяем миграцию через Prisma в Docker контейнере..."
    docker compose exec backend sh -c "npx prisma migrate deploy"

    if [ $? -ne 0 ]; then
        echo "Prisma не работает, пробуем с игнорированием checksum..."
        docker compose exec backend sh -c "PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate && npx prisma migrate deploy"
    fi
else
    echo "Backend контейнер не запущен. Запускаем docker compose..."
    docker compose up -d
    echo "Ждем 10 секунд..."
    sleep 10
    docker compose exec backend sh -c "npx prisma migrate deploy"
fi

# Если всё равно не работает, применим SQL напрямую
if [ $? -ne 0 ]; then
    echo ""
    echo "Применяем SQL миграцию напрямую в PostgreSQL..."

    # Пробуем через docker compose
    if docker compose ps postgres | grep -q "Up"; then
        docker compose exec postgres psql -U trello -d trello << 'EOF'
-- CreateTable
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "avatar" TEXT,
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CardAssignee" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CardAssignee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CardAssignee_cardId_userId_key" ON "CardAssignee"("cardId", "userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CardAssignee_cardId_idx" ON "CardAssignee"("cardId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CardAssignee_userId_idx" ON "CardAssignee"("userId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CardAssignee_cardId_fkey'
    ) THEN
        ALTER TABLE "CardAssignee" ADD CONSTRAINT "CardAssignee_cardId_fkey"
        FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CardAssignee_userId_fkey'
    ) THEN
        ALTER TABLE "CardAssignee" ADD CONSTRAINT "CardAssignee_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
EOF
        echo "✓ SQL миграция применена!"
    else
        echo "PostgreSQL контейнер не запущен."
        echo "Пожалуйста, запустите сначала: docker compose up -d"
    fi
fi

echo ""
echo "=== Проверка ==="
docker compose exec postgres psql -U trello -d trello -c "\dt" | grep -E "User|CardAssignee" && echo "✓ Таблицы созданы успешно!" || echo "✗ Ошибка: таблицы не найдены"

echo ""
echo "Перезапускаем backend..."
docker compose restart backend

echo ""
echo "Готово! Проверьте: curl http://localhost:3001/health"
