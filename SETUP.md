# Инструкция по запуску Task Board

## Быстрый старт с Docker

### 1. Запустите PostgreSQL и приложение

```bash
# Из корневой директории проекта
docker-compose up -d
```

Это запустит:
- PostgreSQL базу данных на порту 5432
- Backend API на порту 3001
- Frontend на порту 3000

### 2. Примените миграции базы данных

```bash
cd backend
docker-compose exec backend npx prisma migrate deploy
```

Или если docker-compose недоступен, выполните миграцию вручную после запуска PostgreSQL:

```bash
cd backend
npm install
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
npx prisma migrate dev
```

### 3. Откройте приложение

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## Локальный запуск без Docker

### Требования
- Node.js 20+
- PostgreSQL 16+ (запущенный и доступный)

### 1. Установите PostgreSQL

Убедитесь, что PostgreSQL запущен. Создайте базу данных:

```bash
psql -U postgres
CREATE DATABASE trello;
CREATE USER trello_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE trello TO trello_user;
```

### 2. Настройте переменные окружения

Создайте файл `backend/.env`:

```env
DATABASE_URL="postgresql://trello_user:your_password@localhost:5432/trello?schema=public"
PORT=3001
```

### 3. Установите зависимости

```bash
# Backend
cd backend
npm install

# Frontend (в другом терминале)
cd frontend
npm install
```

### 4. Примените миграции

```bash
cd backend

# Если есть проблемы с Prisma binaries, используйте:
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate

# Примените миграции
npx prisma migrate dev
```

### 5. Запустите приложение

```bash
# Backend (из директории backend)
npm run dev

# Frontend (из директории frontend, в другом терминале)
npm run dev
```

### 6. Откройте приложение

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

---

## Ручное применение миграций (если Prisma не работает)

Если у вас проблемы с Prisma, можете применить SQL миграцию вручную:

```bash
# Подключитесь к базе данных
psql -U trello_user -d trello

# Выполните SQL из файла
\i backend/migrations/001_add_users.sql
```

Или выполните SQL напрямую:

```sql
-- Создайте таблицы User и CardAssignee
-- (см. backend/migrations/001_add_users.sql)
```

---

## Решение проблем

### Ошибка 500 при запросах к API

**Причина:** Миграции базы данных не применены.

**Решение:**
1. Убедитесь, что PostgreSQL запущен
2. Примените миграции (см. выше)
3. Перезапустите backend

### Prisma не может загрузить binaries (403 Forbidden)

**Причина:** Проблемы с доступом к Prisma CDN.

**Решение:**
```bash
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
```

### База данных не подключается

**Решение:**
1. Проверьте, что PostgreSQL запущен: `pg_isready`
2. Проверьте DATABASE_URL в `backend/.env`
3. Проверьте, что база данных создана
4. Проверьте права доступа пользователя

---

## Первое использование

1. Запустите приложение
2. Нажмите "Пользователи" в header
3. Создайте пользователей для вашей команды
4. Нажмите "Новая доска" для создания доски
5. Добавьте колонки и карточки
6. Назначайте пользователей на задачи!

---

## Полезные команды

```bash
# Просмотр базы данных через Prisma Studio
cd backend
npx prisma studio

# Сброс базы данных
npx prisma migrate reset

# Создание новой миграции
npx prisma migrate dev --name your_migration_name

# Просмотр статуса миграций
npx prisma migrate status
```
