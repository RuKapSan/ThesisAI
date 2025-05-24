# Разница между .env файлом и Railway Environment Variables

## Локальная разработка (.env файл)
- Prisma автоматически читает `.env` файл из корня проекта
- Файл `.env` НЕ коммитится в Git
- Используется для локальной разработки

## Railway (Environment Variables)
- Переменные устанавливаются в Railway Dashboard
- Prisma НЕ видит эти переменные во время сборки!
- Это вызывает ошибку при `prisma migrate deploy`

## Проблема с Prisma в Railway

Когда Railway запускает команду:
```bash
npx prisma migrate deploy
```

Prisma пытается прочитать `DATABASE_URL` из окружения, но:
1. На этапе сборки переменные окружения еще не доступны
2. Template variables (`${{Postgres.DATABASE_URL}}`) резолвятся только в runtime

## Решения

### Решение 1: Использовать migrate deploy в runtime (Рекомендуется)

Обновите `nixpacks.toml`:
```toml
[phases.setup]
nixPkgs = ["nodejs-18_x", "postgresql"]

[phases.install]
cmds = ["npm install"]

[phases.build]
cmds = ["npm run build"]

[start]
# Запускаем миграции в runtime, когда переменные доступны
cmd = "cd backend && npx prisma migrate deploy && cd .. && npm run start"
```

### Решение 2: Создать скрипт запуска

Создайте `start.sh`:
```bash
#!/bin/bash
echo "Running database migrations..."
cd backend && npx prisma migrate deploy
cd ..
echo "Starting application..."
npm run start
```

Обновите `package.json`:
```json
"scripts": {
  "start": "cd backend && npm start",
  "start:production": "./start.sh"
}
```

### Решение 3: Использовать отдельный Build Command

В Railway settings установите:
- **Build Command**: `npm run build`
- **Start Command**: `cd backend && npx prisma migrate deploy && cd .. && npm start`

## Важные моменты

1. **Template Variables** (`${{Postgres.DATABASE_URL}}`) работают только если:
   - У вас есть PostgreSQL сервис в Railway проекте
   - Сервисы связаны между собой

2. **Обычные переменные** (например, `postgresql://user:pass@host/db`):
   - Работают сразу
   - Не требуют дополнительных сервисов
   - Подходят для внешних баз данных

3. **Prisma в Docker vs Railway**:
   - В Docker мы контролируем порядок запуска
   - В Railway миграции должны запускаться в start команде

## Проверочный чеклист

✅ Есть ли PostgreSQL сервис в Railway проекте?
✅ Правильно ли указан DATABASE_URL?
✅ Запускаются ли миграции в start команде, а не в build?
✅ Есть ли все необходимые переменные окружения?

## Если используете внешнюю БД

Просто укажите прямой URL вместо template variable:
```
DATABASE_URL=postgresql://user:password@host.com:5432/database?sslmode=require
```