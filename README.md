# Task Board - Система управления задачами

Современная система управления задачами, похожая на Trello и Jira, созданная для небольших команд.

## Возможности

- ✅ **Доски и колонки** - организуйте проекты по доскам с гибкими колонками
- 🎯 **Карточки задач** - создавайте задачи с описанием, приоритетами и дедлайнами
- 👥 **Управление пользователями** - создавайте пользователей и назначайте их на задачи
- 🏷️ **Метки** - категоризируйте задачи с помощью цветных меток
- ⚡ **Приоритеты** - 4 уровня приоритета (Низкий, Средний, Высокий, Критичный)
- 📅 **Дедлайны** - отслеживайте сроки выполнения задач
- ☑️ **Чеклисты** - разбивайте задачи на подзадачи с прогресс-баром
- 💬 **Комментарии** - обсуждайте задачи прямо в карточках
- 🔗 **Ссылки** - прикрепляйте внешние ресурсы к задачам
- 🎨 **Drag & Drop** - перетаскивайте карточки между колонками
- 🎨 **Темная синяя тема** - приятная цветовая схема с темно-синими акцентами

## Технологии

### Backend
- Node.js + Express
- TypeScript
- PostgreSQL
- Prisma ORM

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- @dnd-kit (Drag & Drop)
- Zustand (State Management)

## 🚀 Быстрый старт (Рекомендуемый способ)

### 1. Запустите PostgreSQL через Docker
```bash
docker compose up -d postgres
```

### 2. Инициализируйте базу данных
```bash
./setup-database.sh
```

Или вручную:
```bash
cat init-database.sql | docker compose exec -T postgres psql -U trello -d trello
```

### 3. Проверьте создание таблиц
```bash
docker compose exec postgres psql -U trello -d trello -c "\dt"
```

Должно быть 11 таблиц: Board, List, Card, Label, Checklist, ChecklistItem, Comment, Link, User, CardAssignee

### 4. Установите зависимости и запустите Backend
```bash
cd backend
npm install
npm run dev
```

Backend запустится на http://localhost:3001

### 5. Установите зависимости и запустите Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend запустится на http://localhost:3000

### 6. Откройте приложение
Перейдите в браузере на http://localhost:3000

## ⚠️ Важно: Почему Backend не в Docker?

Backend запускается локально (не через Docker) из-за несовместимости Prisma с OpenSSL в Alpine контейнерах. Это временное решение для разработки. PostgreSQL остается в Docker для удобства.

### Локальная разработка (без Docker)

#### Требования
- Node.js 20+
- PostgreSQL 16+

#### Установка

1. Установите зависимости:
```bash
npm install
```

2. Настройте базу данных PostgreSQL и создайте файл `.env` в папке `backend`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/trello?schema=public"
PORT=3001
```

3. Выполните миграции базы данных:
```bash
cd backend
npm run prisma:migrate
npm run prisma:generate
```

4. Запустите приложение:
```bash
# Из корневой директории
npm run dev
```

Или запустите backend и frontend отдельно:
```bash
# Backend
cd backend
npm run dev

# Frontend (в другом терминале)
cd frontend
npm run dev
```

## Структура проекта

```
trello/
├── backend/
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── index.ts      # Express app
│   │   └── prisma.ts     # Prisma client
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── types.ts      # TypeScript types
│   │   ├── api.ts        # API client
│   │   ├── store.ts      # Zustand store
│   │   └── App.tsx       # Main component
│   └── package.json
├── docker-compose.yml
└── README.md
```

## API Endpoints

### Boards
- `GET /api/boards` - получить все доски
- `GET /api/boards/:id` - получить доску
- `POST /api/boards` - создать доску
- `PUT /api/boards/:id` - обновить доску
- `DELETE /api/boards/:id` - удалить доску

### Lists
- `POST /api/lists` - создать колонку
- `PUT /api/lists/:id` - обновить колонку
- `DELETE /api/lists/:id` - удалить колонку
- `POST /api/lists/reorder` - изменить порядок колонок

### Cards
- `POST /api/cards` - создать карточку
- `PUT /api/cards/:id` - обновить карточку
- `DELETE /api/cards/:id` - удалить карточку
- `POST /api/cards/:id/move` - переместить карточку
- `POST /api/cards/reorder` - изменить порядок карточек

### Checklists
- `POST /api/checklists` - создать чеклист
- `PUT /api/checklists/:id` - обновить чеклист
- `DELETE /api/checklists/:id` - удалить чеклист
- `POST /api/checklists/:id/items` - добавить пункт
- `PUT /api/checklists/items/:id` - обновить пункт
- `DELETE /api/checklists/items/:id` - удалить пункт

### Comments
- `POST /api/comments` - создать комментарий
- `PUT /api/comments/:id` - обновить комментарий
- `DELETE /api/comments/:id` - удалить комментарий

### Links
- `POST /api/links` - создать ссылку
- `PUT /api/links/:id` - обновить ссылку
- `DELETE /api/links/:id` - удалить ссылку

### Labels
- `POST /api/labels` - создать метку
- `PUT /api/labels/:id` - обновить метку
- `DELETE /api/labels/:id` - удалить метку

### Users
- `GET /api/users` - получить всех пользователей
- `POST /api/users` - создать пользователя
- `PUT /api/users/:id` - обновить пользователя
- `DELETE /api/users/:id` - удалить пользователя
- `POST /api/users/:userId/assign/:cardId` - назначить пользователя на карточку
- `DELETE /api/users/:userId/unassign/:cardId` - снять пользователя с карточки

## Развертывание на сервере

### Production с Docker

1. Создайте production версию `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    environment:
      DATABASE_URL: ${DATABASE_URL}
      PORT: 3001
    depends_on:
      - postgres

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
```

2. Создайте production Dockerfile для backend (`backend/Dockerfile.prod`):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
```

3. Создайте production Dockerfile для frontend (`frontend/Dockerfile.prod`):
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

4. Создайте `.env` файл с production настройками

5. Запустите:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🔧 Устранение неполадок

### Backend не запускается
**Симптомы:** `curl http://localhost:3001/health` возвращает "Connection refused"

**Решение:**
1. Убедитесь, что вы запустили backend через `cd backend && npm run dev`
2. Проверьте, что порт 3001 не занят: `lsof -i :3001`
3. Проверьте логи backend на ошибки

### База данных пуста
**Симптомы:** Ошибка "relation 'Board' does not exist" или таблицы не найдены

**Решение:**
```bash
# Применить полную инициализацию
./setup-database.sh

# Или вручную
cat init-database.sql | docker compose exec -T postgres psql -U trello -d trello

# Проверить результат
docker compose exec postgres psql -U trello -d trello -c "\dt"
```

### 500 ошибки в API
**Симптомы:** Frontend показывает 500 Internal Server Error

**Причины и решения:**
1. **База данных не инициализирована** - запустите `./setup-database.sh`
2. **Backend не подключается к БД** - проверьте DATABASE_URL в `backend/.env`
3. **Таблицы отсутствуют** - примените init-database.sql

### Frontend не может подключиться к Backend
**Симптомы:** Ошибки "Failed to fetch" в консоли браузера

**Решение:**
1. Убедитесь, что backend запущен: `curl http://localhost:3001/health`
2. Проверьте, что в `frontend/src/api.ts` правильный URL: `http://localhost:3001/api`

### Prisma ошибки в Docker
**Симптомы:** "Prisma failed to detect the libssl/openssl version"

**Решение:** Это известная проблема. Запускайте backend локально, а не через Docker.

## База данных

Схема базы данных включает:
- **Board** - доски проектов
- **List** - колонки на доске
- **Card** - карточки задач
- **Label** - метки для карточек
- **Checklist** - чеклисты в карточках
- **ChecklistItem** - пункты чеклистов
- **Comment** - комментарии к карточкам
- **Link** - ссылки в карточках
- **User** - пользователи системы
- **CardAssignee** - назначения пользователей на карточки

### Connection String
```
DATABASE_URL="postgresql://trello:trello@localhost:5432/trello"
```

## Лицензия

MIT

## Поддержка

Для вопросов и предложений создавайте issue в репозитории.
