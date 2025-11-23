# Руководство по развертыванию Trello на takta.space

## 🚀 Часть 1: Настройка автозапуска при сбоях

### 1.1 Установка systemd services

```bash
cd /trello
./install-services.sh
```

Это установит 3 сервиса:
- `trello-postgres.service` - PostgreSQL в Docker
- `trello-backend.service` - Backend API
- `trello-frontend.service` - Frontend

### 1.2 Запуск сервисов

```bash
sudo systemctl start trello-postgres
sudo systemctl start trello-backend
sudo systemctl start trello-frontend
```

### 1.3 Проверка статуса

```bash
sudo systemctl status trello-backend
sudo systemctl status trello-frontend
tail -f /var/log/trello-backend.log
```

---

## 🌐 Часть 2: Привязка к домену takta.space

### 2.1 Установка Nginx конфигурации

```bash
cd /trello/nginx
./install-nginx.sh
```

### 2.2 Проверка конфигурации

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 2.3 Настройка DNS

Убедитесь, что DNS запись для `takta.space` указывает на IP вашего сервера:

```
A    takta.space    ->  ВАШ_IP
A    www.takta.space -> ВАШ_IP
```

### 2.4 (Опционально) Получение SSL сертификата

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d takta.space -d www.takta.space
```

После получения сертификата, раскомментируйте HTTPS блок в `/etc/nginx/sites-available/takta.space.conf`

---

## 📊 Часть 3: JIRA-style номера задач

### 3.1 Применение миграции

```bash
cd /trello
cat migrations/002_add_jira_keys.sql | docker compose exec -T postgres psql -U trello -d trello
```

### 3.2 Обновление Prisma schema

Prisma schema уже обновлена. После решения проблемы с Prisma CDN, запустите:

```bash
cd backend
npx prisma generate
```

### 3.3 Как это работает

- Каждая доска теперь имеет ключ (например: "PROJ", "DEV", "MARK")
- Карточки получают уникальные номера: `PROJ-1`, `PROJ-2`, `PROJ-3`
- Номера автоинкрементируются при создании

---

## 🎨 Часть 4: Темная и светлая тема

### 4.1 Что нужно сделать

1. Создать `frontend/src/contexts/ThemeContext.tsx`
2. Обновить `tailwind.config.js` для поддержки dark mode
3. Обновить компоненты для использования dark: классов
4. Добавить кнопку переключения темы

### 4.2 Обновление tailwind.config.js

```javascript
module.exports = {
  darkMode: 'class', // Enable dark mode
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light theme
        'bg-primary': '#F8FAFC',
        'bg-secondary': '#FFFFFF',
        'text-primary': '#1E293B',
        'text-secondary': '#64748B',
        
        // Dark theme (auto with dark: prefix)
        dark: {
          'bg-primary': '#0F172A',
          'bg-secondary': '#1E293B',
          'text-primary': '#F1F5F9',
          'text-secondary': '#94A3B8',
        }
      }
    }
  }
}
```

---

## 👤 Часть 5: Личный кабинет пользователя

### 5.1 Новая страница Dashboard

Создать `/my-tasks` страницу, которая показывает:
- Все задачи назначенные пользователю
- Фильтры: По приоритету, дедлайну, статусу
- Группировка: По доскам, по статусу

### 5.2 Backend endpoint

```
GET /api/users/:userId/tasks
```

Возвращает все карточки где пользователь назначен.

### 5.3 Frontend компонент

Создать `components/Dashboard.tsx` с:
- Список задач пользователя
- Фильтры и сортировка
- Статистика (сколько задач, сколько выполнено)

---

## ✅ Проверка работоспособности

После всех настроек:

1. Откройте `http://takta.space` (или `https://takta.space` с SSL)
2. Создайте доску с ключом "PROJ"
3. Создайте карточку - она должна получить номер "PROJ-1"
4. Переключите тему с light на dark
5. Создайте пользователя и назначьте его на задачи
6. Откройте `/my-tasks` чтобы увидеть его задачи

---

## 🔧 Решение проблемы с Prisma

### Временное решение

До решения проблемы с Prisma CDN (403), используйте Docker для генерации:

```bash
cd /trello
docker run --rm -v $(pwd):/app -w /app node:20 sh -c \
  "cd backend && npm install --legacy-peer-deps && npx prisma generate"
```

### Постоянное решение

После генерации Prisma Client один раз, он сохраняется в `node_modules/.prisma/client/`.
При деплое в production, используйте готовый build с уже сгенерированным клиентом.

---

## 📝 Скрипты для автоматизации

### Полный перезапуск

```bash
#!/bin/bash
# restart-all.sh

sudo systemctl restart trello-postgres
sleep 5
sudo systemctl restart trello-backend
sleep 3
sudo systemctl restart trello-frontend

echo "✓ Все сервисы перезапущены"
```

### Проверка здоровья

```bash
#!/bin/bash
# health-check.sh

echo "PostgreSQL:"
docker compose exec postgres pg_isready -U trello

echo "Backend:"
curl -s http://localhost:3223/health

echo "Frontend:"
curl -s http://localhost:3000 | head -n 1

echo "Domain:"
curl -s http://takta.space | head -n 1
```

---

## 🎯 Следующие шаги

1. ✅ Установить systemd services
2. ✅ Настроить Nginx для takta.space
3. ⏳ Решить проблему с Prisma CDN
4. ⏳ Применить миграцию для JIRA-номеров
5. ⏳ Добавить темную тему
6. ⏳ Создать личный кабинет

