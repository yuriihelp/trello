#!/bin/bash

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Остановка Task Board ===${NC}"
echo ""

# Остановка Backend
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    if ps -p $BACKEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Останавливаем Backend (PID: $BACKEND_PID)...${NC}"
        kill $BACKEND_PID 2>/dev/null
        sleep 1
        # Если процесс все еще жив, убиваем силой
        if ps -p $BACKEND_PID > /dev/null 2>&1; then
            kill -9 $BACKEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✓ Backend остановлен${NC}"
    else
        echo -e "${YELLOW}Backend уже остановлен${NC}"
    fi
    rm .backend.pid
else
    echo -e "${YELLOW}Backend PID не найден${NC}"
fi

# Остановка Frontend
if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    if ps -p $FRONTEND_PID > /dev/null 2>&1; then
        echo -e "${YELLOW}Останавливаем Frontend (PID: $FRONTEND_PID)...${NC}"
        kill $FRONTEND_PID 2>/dev/null
        sleep 1
        # Если процесс все еще жив, убиваем силой
        if ps -p $FRONTEND_PID > /dev/null 2>&1; then
            kill -9 $FRONTEND_PID 2>/dev/null
        fi
        echo -e "${GREEN}✓ Frontend остановлен${NC}"
    else
        echo -e "${YELLOW}Frontend уже остановлен${NC}"
    fi
    rm .frontend.pid
else
    echo -e "${YELLOW}Frontend PID не найден${NC}"
fi

# Останавливаем PostgreSQL
echo -e "${YELLOW}Останавливаем PostgreSQL...${NC}"
docker compose down > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ PostgreSQL остановлен${NC}"
fi

# Убиваем процессы на портах (на всякий случай)
for port in 3223 3000; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}Освобождаем порт $port...${NC}"
        kill -9 $(lsof -t -i:$port) 2>/dev/null
    fi
done

echo ""
echo -e "${GREEN}✓ Все сервисы остановлены${NC}"
echo ""
