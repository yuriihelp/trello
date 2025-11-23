# Task Board - Система управления задачами

Современная система управления задачами, похожая на Trello и Jira, созданная для небольших команд.

## Возможности

- ✅ **Доски и колонки** - организуйте проекты по доскам с гибкими колонками
- 🎯 **Карточки задач** - создавайте задачи с описанием, приоритетами и дедлайнами
- 🏷️ **Метки** - категоризируйте задачи с помощью цветных меток
- ⚡ **Приоритеты** - 4 уровня приоритета (Низкий, Средний, Высокий, Критичный)
- 📅 **Дедлайны** - отслеживайте сроки выполнения задач
- ☑️ **Чеклисты** - разбивайте задачи на подзадачи с прогресс-баром
- 💬 **Комментарии** - обсуждайте задачи прямо в карточках
- 🔗 **Ссылки** - прикрепляйте внешние ресурсы к задачам
- 🎨 **Drag & Drop** - перетаскивайте карточки между колонками

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

## Быстрый старт

### С помощью Docker (Рекомендуется)

1. Убедитесь, что у вас установлен Docker и Docker Compose

2. Клонируйте репозиторий и перейдите в директорию:
```bash
cd trello
```

3. Запустите приложение:
```bash
docker-compose up -d
```

4. Откройте в браузере:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Database: localhost:5432

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

## Лицензия

MIT

## Поддержка

Для вопросов и предложений создавайте issue в репозитории.
