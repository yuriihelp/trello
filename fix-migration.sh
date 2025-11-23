#!/bin/bash

echo "=== Исправление и применение миграции ==="
echo ""

# Проверяем логи backend
echo "1. Проверяем логи backend..."
docker compose logs backend --tail=50

echo ""
echo "2. Проверяем подключение к PostgreSQL..."
docker compose ps

echo ""
echo "3. Применяем миграцию напрямую в PostgreSQL контейнер..."

# Применяем SQL миграцию
docker compose exec -T postgres psql -U trello -d trello << 'EOF'
-- Проверяем существующие таблицы
\dt

-- CreateTable User
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

-- CreateTable CardAssignee
CREATE TABLE IF NOT EXISTS "CardAssignee" (
    "id" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CardAssignee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "CardAssignee_cardId_userId_key" ON "CardAssignee"("cardId", "userId");
CREATE INDEX IF NOT EXISTS "CardAssignee_cardId_idx" ON "CardAssignee"("cardId");
CREATE INDEX IF NOT EXISTS "CardAssignee_userId_idx" ON "CardAssignee"("userId");

-- AddForeignKey
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CardAssignee_cardId_fkey') THEN
        ALTER TABLE "CardAssignee" ADD CONSTRAINT "CardAssignee_cardId_fkey"
        FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'CardAssignee_userId_fkey') THEN
        ALTER TABLE "CardAssignee" ADD CONSTRAINT "CardAssignee_userId_fkey"
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Проверяем результат
\dt
SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
EOF

echo ""
echo "4. Перезапускаем backend..."
docker compose restart backend

echo ""
echo "5. Ждем 5 секунд..."
sleep 5

echo ""
echo "6. Проверяем здоровье backend..."
curl -s http://localhost:3001/health || echo "Backend не отвечает"

echo ""
echo "7. Проверяем логи backend после перезапуска..."
docker compose logs backend --tail=20

echo ""
echo "=== Если backend всё ещё не работает, проверьте полные логи: ==="
echo "docker compose logs backend"
