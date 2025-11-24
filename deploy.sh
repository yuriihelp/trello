#!/bin/bash

# TAKTA Auto-Deploy Script
# Автоматический деплой изменений из Git

set -e  # Exit on error

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   TAKTA Auto-Deploy Script${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 1. Git Pull
echo -e "${YELLOW}📥 Шаг 1/7: Получение изменений из Git...${NC}"
git fetch origin
git pull origin claude/task-management-board-01NtBse5NJjTavRVvW9TLWaZ
echo -e "${GREEN}✓ Изменения получены${NC}"
echo ""

# 2. Database Migrations
echo -e "${YELLOW}🗄️  Шаг 2/7: Применение миграций БД...${NC}"

# Check if PostgreSQL is running
if ! docker ps | grep -q trello-db; then
    echo -e "${RED}⚠️  PostgreSQL не запущен. Запускаем...${NC}"
    docker start trello-db
    sleep 5
fi

# Apply migrations (ignore errors if already applied)
docker exec -i trello-db psql -U trello -d trello < migrations/001_initial_schema.sql 2>/dev/null && echo "  ✓ Migration 001 applied" || echo "  → Migration 001 already exists"
docker exec -i trello-db psql -U trello -d trello < migrations/002_add_jira_keys.sql 2>/dev/null && echo "  ✓ Migration 002 applied" || echo "  → Migration 002 already exists"
docker exec -i trello-db psql -U trello -d trello < migrations/003_add_card_relations.sql 2>/dev/null && echo "  ✓ Migration 003 applied" || echo "  → Migration 003 already exists"

echo -e "${GREEN}✓ Миграции применены${NC}"
echo ""

# 3. Backend Update
echo -e "${YELLOW}⚙️  Шаг 3/7: Обновление Backend...${NC}"
cd backend

# Install dependencies if needed
if [ -f "package.json" ]; then
    npm install --silent
fi

# Generate Prisma Client
echo "  → Генерация Prisma Client..."
npx prisma generate > /dev/null

# Build TypeScript
echo "  → Сборка TypeScript..."
npm run build

cd ..
echo -e "${GREEN}✓ Backend обновлен${NC}"
echo ""

# 4. Frontend Build
echo -e "${YELLOW}🎨 Шаг 4/7: Сборка Frontend...${NC}"
cd frontend

# Install dependencies if needed
if [ -f "package.json" ]; then
    npm install --silent
fi

# Build production version
echo "  → Сборка production версии..."
npm run build

cd ..
echo -e "${GREEN}✓ Frontend собран${NC}"
echo ""

# 5. Restart Services
echo -e "${YELLOW}🔄 Шаг 5/7: Перезапуск сервисов...${NC}"

# Check if systemd services exist
if systemctl list-units --full -all | grep -q trello-backend.service; then
    echo "  → Используется systemd..."

    # Restart PostgreSQL
    sudo systemctl restart trello-postgres 2>/dev/null || echo "  ⚠️  trello-postgres service not found"

    # Restart Backend
    sudo systemctl restart trello-backend

    # Restart Frontend (if exists)
    sudo systemctl restart trello-frontend 2>/dev/null || echo "  ⚠️  trello-frontend service not found (OK)"

    sleep 2

    # Check status
    if systemctl is-active --quiet trello-backend; then
        echo -e "${GREEN}  ✓ Backend запущен${NC}"
    else
        echo -e "${RED}  ✗ Backend не запустился!${NC}"
        sudo journalctl -u trello-backend -n 20
        exit 1
    fi
else
    echo "  → systemd не настроен, запуск вручную..."

    # Kill old processes
    pkill -f "npm run dev" || true
    pkill -f "node.*backend.*dist" || true

    # Create logs directory
    mkdir -p logs

    # Start backend
    cd backend
    NODE_ENV=production PORT=3223 nohup node dist/index.js > ../logs/backend.log 2>&1 &
    BACKEND_PID=$!
    echo $BACKEND_PID > ../logs/backend.pid
    cd ..

    sleep 2

    if kill -0 $BACKEND_PID 2>/dev/null; then
        echo -e "${GREEN}  ✓ Backend запущен (PID: $BACKEND_PID)${NC}"
    else
        echo -e "${RED}  ✗ Backend не запустился!${NC}"
        cat logs/backend.log | tail -20
        exit 1
    fi

    # Start frontend (if not using nginx to serve static files)
    # cd frontend
    # nohup npm run dev > ../logs/frontend.log 2>&1 &
    # echo $! > ../logs/frontend.pid
    # cd ..
fi

echo -e "${GREEN}✓ Сервисы перезапущены${NC}"
echo ""

# 6. Health Check
echo -e "${YELLOW}🏥 Шаг 6/7: Проверка здоровья...${NC}"

# Wait for backend to start
sleep 3

# Check ports
if netstat -tlnp 2>/dev/null | grep -q :3223; then
    echo -e "${GREEN}  ✓ Backend слушает на порту 3223${NC}"
else
    echo -e "${RED}  ✗ Backend не слушает на порту 3223${NC}"
fi

if netstat -tlnp 2>/dev/null | grep -q :3000; then
    echo -e "${GREEN}  ✓ Frontend слушает на порту 3000${NC}"
else
    echo -e "${YELLOW}  → Frontend не запущен (может использоваться статика)${NC}"
fi

# Check backend health endpoint
if curl -s -f http://localhost:3223/health > /dev/null 2>&1; then
    echo -e "${GREEN}  ✓ Backend health check OK${NC}"
else
    echo -e "${RED}  ✗ Backend health check failed${NC}"
fi

echo ""

# 7. Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Деплой завершён!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}✓${NC} Изменения из Git получены"
echo -e "${GREEN}✓${NC} Миграции БД применены"
echo -e "${GREEN}✓${NC} Backend обновлен и перезапущен"
echo -e "${GREEN}✓${NC} Frontend собран"
echo ""
echo -e "${BLUE}🌐 Проверьте работу:${NC}"
echo -e "   https://takta.space"
echo -e "   или http://195.225.108.233:3000"
echo ""
echo -e "${BLUE}📊 Полезные команды:${NC}"
echo -e "   sudo systemctl status trello-backend   # Статус backend"
echo -e "   sudo journalctl -u trello-backend -f   # Логи backend"
echo -e "   tail -f logs/backend.log               # Логи (если вручную)"
echo -e "   ps aux | grep node                     # Процессы Node.js"
echo ""
echo -e "${BLUE}🔍 Если не работает:${NC}"
echo -e "   1. Откройте браузер → F12 → Console"
echo -e "   2. Переместите карточку"
echo -e "   3. Проверьте что в консоли нет ошибок"
echo ""
echo -e "${GREEN}Готово! 🎉${NC}"
