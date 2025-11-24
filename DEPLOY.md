# 🚀 Полный гайд по деплою TAKTA на сервер

## 📋 Предварительные требования

- SSH доступ к серверу
- Git установлен
- Node.js v20+ установлен
- PostgreSQL в Docker
- Права sudo

## 🔄 Быстрый деплой (автоматический)

```bash
# На сервере
cd /trello
bash deploy.sh
```

## 📝 Пошаговый деплой (ручной)

### 1️⃣ Подключение к серверу

```bash
ssh root@195.225.108.233
cd /trello
```

### 2️⃣ Получение последних изменений из Git

```bash
# Получить изменения
git fetch origin

# Проверить текущую ветку
git branch

# Переключиться на рабочую ветку (если нужно)
git checkout claude/task-management-board-01NtBse5NJjTavRVvW9TLWaZ

# Подтянуть изменения
git pull origin claude/task-management-board-01NtBse5NJjTavRVvW9TLWaZ
```

### 3️⃣ Применение миграций базы данных

```bash
# Проверить что PostgreSQL запущен
docker ps | grep postgres

# Если не запущен:
docker start trello-db

# Применить все миграции по порядку
docker exec -i trello-db psql -U trello -d trello < migrations/001_initial_schema.sql 2>/dev/null || echo "Migration 001 already applied"
docker exec -i trello-db psql -U trello -d trello < migrations/002_add_jira_keys.sql 2>/dev/null || echo "Migration 002 already applied"
docker exec -i trello-db psql -U trello -d trello < migrations/003_add_card_relations.sql 2>/dev/null || echo "Migration 003 already applied"

# Проверить таблицы
docker exec -i trello-db psql -U trello -d trello -c "\dt"
```

### 4️⃣ Обновление Backend

```bash
cd backend

# Установить зависимости (если package.json изменился)
npm install

# Сгенерировать Prisma Client
npx prisma generate

# Собрать TypeScript
npm run build

# Вернуться в корень
cd ..
```

### 5️⃣ Обновление Frontend

```bash
cd frontend

# Установить зависимости (если package.json изменился)
npm install

# Собрать production версию
npm run build

# Проверить что dist создан
ls -la dist/

# Вернуться в корень
cd ..
```

### 6️⃣ Перезапуск сервисов

#### Вариант А: С systemd (рекомендуется)

```bash
# Перезапустить все сервисы
sudo systemctl restart trello-postgres
sudo systemctl restart trello-backend
sudo systemctl restart trello-frontend

# Проверить статус
sudo systemctl status trello-backend
sudo systemctl status trello-frontend

# Проверить логи
sudo journalctl -u trello-backend -f
```

#### Вариант Б: Вручную (если systemd не настроен)

```bash
# Остановить старые процессы
pkill -f "npm run dev" || true
pkill -f "node.*backend.*dist" || true
pkill -f "vite" || true

# Запустить backend
cd backend
NODE_ENV=production PORT=3223 nohup node dist/index.js > ../logs/backend.log 2>&1 &
echo $! > ../logs/backend.pid
cd ..

# Запустить frontend (dev mode с vite для HMR)
cd frontend
nohup npm run dev > ../logs/frontend.log 2>&1 &
echo $! > ../logs/frontend.pid
cd ..
```

### 7️⃣ Проверка работы

```bash
# Проверить порты
netstat -tlnp | grep -E '3000|3223'

# Проверить процессы
ps aux | grep node

# Проверить backend API
curl -s http://localhost:3223/health

# Проверить frontend
curl -s http://localhost:3000 | head -20

# Проверить логи backend
tail -f backend/backend.log
# или
sudo journalctl -u trello-backend -f
```

### 8️⃣ Проверка в браузере

1. Откройте https://takta.space
2. Нажмите **F12** → вкладка **Console**
3. Проверьте что нет ошибок
4. Попробуйте:
   - Открыть карточку (должна открыться в модальном окне)
   - Переместить карточку между колонками
   - Перезагрузить страницу (изменения должны сохраниться)

## 🔍 Диагностика проблем

### Backend не запускается

```bash
# Проверить логи
sudo journalctl -u trello-backend -f

# Или ручные логи
tail -f logs/backend.log

# Проверить что порт свободен
netstat -tlnp | grep 3223

# Убить процесс на порту (если занят)
sudo kill -9 $(lsof -ti:3223)
```

### Frontend не открывается

```bash
# Проверить логи
tail -f logs/frontend.log

# Проверить что порт свободен
netstat -tlnp | grep 3000

# Пересобрать
cd frontend
npm run build
```

### База данных не работает

```bash
# Проверить Docker
docker ps | grep postgres

# Запустить если остановлен
docker start trello-db

# Проверить логи
docker logs trello-db

# Подключиться к БД
docker exec -it trello-db psql -U trello -d trello

# В psql:
\dt                    # Показать таблицы
SELECT * FROM "Board"; # Проверить данные
\q                     # Выйти
```

### Перемещение карточек не сохраняется

1. Откройте консоль браузера (F12 → Console)
2. Переместите карточку
3. Проверьте вывод:

```
🔄 Moving card between lists: [...]
✅ API reorderCards успешно выполнен
✅ Card moved successfully
```

Если видите ошибку:
```
❌ Failed to reorder cards: 404
```
→ Backend не обновлен или не запущен

```
❌ Failed to reorder cards: 500
```
→ Проверьте логи backend: `sudo journalctl -u trello-backend -f`

### Связи между задачами не работают

```bash
# Проверить что миграция применена
docker exec -i trello-db psql -U trello -d trello -c "SELECT * FROM pg_type WHERE typname = 'RelationType';"

# Если пустой результат - применить миграцию:
docker exec -i trello-db psql -U trello -d trello < migrations/003_add_card_relations.sql
```

## 🎯 Настройка systemd (первый раз)

Если systemd сервисы еще не установлены:

```bash
cd /trello

# Установить все сервисы
bash install-services.sh

# Или вручную:
sudo cp systemd/trello-postgres.service /etc/systemd/system/
sudo cp systemd/trello-backend.service /etc/systemd/system/
sudo cp systemd/trello-frontend.service /etc/systemd/system/

# Обновить systemd
sudo systemctl daemon-reload

# Включить автозапуск
sudo systemctl enable trello-postgres
sudo systemctl enable trello-backend
sudo systemctl enable trello-frontend

# Запустить
sudo systemctl start trello-postgres
sudo systemctl start trello-backend
sudo systemctl start trello-frontend
```

## 📊 Мониторинг

### Проверка здоровья системы

```bash
# Все сразу
systemctl status trello-* --no-pager

# CPU и память
top -p $(pgrep -d, -f "node.*backend")

# Размер БД
docker exec trello-db psql -U trello -d trello -c "SELECT pg_size_pretty(pg_database_size('trello'));"

# Логи за последние 10 минут
sudo journalctl -u trello-backend --since "10 min ago"
```

## 🔐 Настройка SSL (опционально)

```bash
# Установить certbot
sudo apt install certbot python3-certbot-nginx

# Получить сертификат
sudo certbot --nginx -d takta.space -d www.takta.space

# Автопродление
sudo certbot renew --dry-run
```

## 📞 Поддержка

Если что-то не работает:
1. Проверьте логи (см. раздел Диагностика)
2. Убедитесь что все порты открыты: 3000, 3223, 5432
3. Проверьте консоль браузера (F12)
4. Перезапустите все сервисы

---

**Последнее обновление:** 2025-11-24
**Версия:** 1.0.0
