#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Запуск Task Board (Локально) ===${NC}"
echo ""

# Проверка зависимостей
command -v node >/dev/null 2>&1 || { echo -e "${RED}❌ Node.js не установлен${NC}"; exit 1; }
command -v docker >/dev/null 2>&1 || { echo -e "${RED}❌ Docker не установлен${NC}"; exit 1; }

# Шаг 1: Запуск PostgreSQL
echo -e "${BLUE}1. Запуск PostgreSQL...${NC}"
docker compose up -d postgres

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PostgreSQL запущен${NC}"
else
    echo -e "${RED}✗ Ошибка запуска PostgreSQL${NC}"
    exit 1
fi

# Ждем запуска PostgreSQL
echo -e "${BLUE}2. Ожидание запуска PostgreSQL (5 сек)...${NC}"
sleep 5

# Шаг 2: Проверка и инициализация БД
echo -e "${BLUE}3. Проверка базы данных...${NC}"
TABLE_COUNT=$(docker compose exec -T postgres psql -U trello -d trello -t -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public';" 2>/dev/null | tr -d ' ')

if [ -z "$TABLE_COUNT" ] || [ "$TABLE_COUNT" -lt "10" ]; then
    echo -e "${YELLOW}   База данных пуста. Применяем инициализацию...${NC}"
    cat init-database.sql | docker compose exec -T postgres psql -U trello -d trello > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}   ✓ База данных инициализирована${NC}"
    else
        echo -e "${RED}   ✗ Ошибка инициализации БД${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}   ✓ База данных уже настроена (таблиц: $TABLE_COUNT)${NC}"
fi

# Шаг 3: Установка зависимостей Backend
echo -e "${BLUE}4. Проверка зависимостей Backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   Установка зависимостей...${NC}"
    npm install > /dev/null 2>&1
    echo -e "${GREEN}   ✓ Зависимости установлены${NC}"
else
    echo -e "${GREEN}   ✓ Зависимости уже установлены${NC}"
fi

# Генерация Prisma Client
echo -e "${BLUE}5. Генерация Prisma Client...${NC}"
npx prisma generate > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✓ Prisma Client сгенерирован${NC}"
else
    echo -e "${RED}   ✗ Ошибка генерации Prisma Client${NC}"
    exit 1
fi

cd ..

# Шаг 4: Установка зависимостей Frontend
echo -e "${BLUE}6. Проверка зависимостей Frontend...${NC}"
cd frontend
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}   Установка зависимостей...${NC}"
    npm install > /dev/null 2>&1
    echo -e "${GREEN}   ✓ Зависимости установлены${NC}"
else
    echo -e "${GREEN}   ✓ Зависимости уже установлены${NC}"
fi
cd ..

# Шаг 5: Запуск Backend
echo -e "${BLUE}7. Запуск Backend на порту 3223...${NC}"

# Проверяем, не занят ли порт
if lsof -Pi :3223 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}   Порт 3223 занят, останавливаем процесс...${NC}"
    kill -9 $(lsof -t -i:3223) 2>/dev/null
    sleep 1
fi

cd backend
nohup npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Ждем запуска backend
echo -e "${YELLOW}   Ожидание запуска Backend...${NC}"
for i in {1..10}; do
    sleep 1
    if curl -s http://localhost:3223/health > /dev/null 2>&1; then
        echo -e "${GREEN}   ✓ Backend запущен (PID: $BACKEND_PID)${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}   ✗ Backend не запустился за 10 секунд${NC}"
        echo -e "${YELLOW}   Проверьте логи: tail -f backend.log${NC}"
        exit 1
    fi
done

# Шаг 6: Запуск Frontend
echo -e "${BLUE}8. Запуск Frontend на порту 3000...${NC}"

# Проверяем, не занят ли порт
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo -e "${YELLOW}   Порт 3000 занят, останавливаем процесс...${NC}"
    kill -9 $(lsof -t -i:3000) 2>/dev/null
    sleep 1
fi

cd frontend
nohup npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Ждем запуска frontend
echo -e "${YELLOW}   Ожидание запуска Frontend...${NC}"
for i in {1..15}; do
    sleep 1
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo -e "${GREEN}   ✓ Frontend запущен (PID: $FRONTEND_PID)${NC}"
        break
    fi
    if [ $i -eq 15 ]; then
        echo -e "${RED}   ✗ Frontend не запустился за 15 секунд${NC}"
        echo -e "${YELLOW}   Проверьте логи: tail -f frontend.log${NC}"
        exit 1
    fi
done

# Сохраняем PIDs
echo "$BACKEND_PID" > .backend.pid
echo "$FRONTEND_PID" > .frontend.pid

# Финал
echo ""
echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   ✓ Все сервисы запущены успешно!     ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📊 Сервисы:${NC}"
echo -e "   • PostgreSQL:  ${GREEN}docker (порт 5432)${NC}"
echo -e "   • Backend:     ${GREEN}http://localhost:3223${NC} (PID: $BACKEND_PID)"
echo -e "   • Frontend:    ${GREEN}http://localhost:3000${NC} (PID: $FRONTEND_PID)"
echo ""
echo -e "${BLUE}📝 Логи:${NC}"
echo -e "   • Backend:  ${YELLOW}tail -f backend.log${NC}"
echo -e "   • Frontend: ${YELLOW}tail -f frontend.log${NC}"
echo ""
echo -e "${BLUE}🌐 Откройте в браузере:${NC}"
echo -e "   ${GREEN}http://localhost:3000${NC}"
echo ""
echo -e "${BLUE}⚠️  Для остановки:${NC}"
echo -e "   ${YELLOW}./stop-local.sh${NC}"
echo ""
