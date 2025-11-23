#!/bin/bash
echo "=== Исправление Prisma ==="

# Попытка 1: Использовать Docker для генерации
echo "1. Попытка сгенерировать через Docker..."
docker run --rm -v $(pwd):/app -w /app/backend node:20 sh -c "npm install && npx prisma generate" 2>&1 | tail -5

if [ $? -eq 0 ]; then
    echo "✓ Успех через Docker"
    exit 0
fi

# Попытка 2: Использовать proxy
echo "2. Попытка через proxy..."
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
npx prisma generate 2>&1 | tail -5

echo ""
echo "Если ничего не помогло, нужно:"
echo "1. Использовать VPN"
echo "2. Или скачать engines вручную"
