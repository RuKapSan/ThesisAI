# Окончательное решение для Railway

## Проблема
Переменные окружения не передаются в Prisma при запуске миграций через `cd backend && npx prisma migrate deploy`.

## Решение

### Вариант 1: Используйте прямые URL вместо template variables

В Railway Variables измените:
```
# Вместо:
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Используйте прямой internal URL:
DATABASE_URL=postgresql://postgres:ВАШ_ПАРОЛЬ@postgres.railway.internal:5432/railway
```

Чтобы узнать правильный URL:
1. Откройте PostgreSQL сервис в Railway
2. Перейдите в вкладку "Connect"
3. Скопируйте "Private URL"

### Вариант 2: Запустите миграции отдельно

1. Временно измените start команду:
   ```json
   "start": "cd backend && npm start"
   ```

2. После деплоя запустите миграции через Railway CLI:
   ```bash
   railway run --service=ваш-сервис npx prisma migrate deploy --schema=backend/prisma/schema.prisma
   ```

3. Или через Railway Shell в браузере

### Вариант 3: Debug что происходит

Временно измените start команду на:
```json
"start": "node debug-env.js"
```

Это покажет, какие переменные окружения доступны.

### Вариант 4: Используйте созданный скрипт

Файл `railway-start.js` уже настроен правильно. Он:
- Проверяет наличие DATABASE_URL
- Явно передает переменные в подпроцессы
- Показывает диагностику

## Рекомендация

Если вы видите "DATABASE_URL: Not set" в логах, значит:

1. **Проверьте Railway Variables еще раз** - возможно переменная не сохранилась
2. **Проверьте, что PostgreSQL сервис подключен** к вашему приложению
3. **Попробуйте пересоздать переменную** - иногда Railway глючит

## Quick Fix

Самый быстрый способ - использовать внешнюю БД:

1. Создайте БД на [Supabase](https://supabase.com) (бесплатно)
2. Скопируйте connection string
3. Вставьте его прямо в DATABASE_URL (не template variable)
4. Всё заработает!

## Проверка подключения сервисов

В Railway убедитесь, что:
- PostgreSQL сервис показывает "Connected" к вашему приложению
- В Variables есть зеленая галочка рядом с `${{Postgres.DATABASE_URL}}`