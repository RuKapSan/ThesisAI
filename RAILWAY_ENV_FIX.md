# Решение проблемы с переменными окружения в Railway

## Проблема
Prisma не видит `DATABASE_URL` при запуске `npx prisma migrate deploy` в Railway, хотя переменная установлена.

## Причина
При выполнении `cd backend && npx prisma migrate deploy`, переменные окружения не всегда корректно передаются в подпроцесс.

## Решения

### Решение 1: Использовать Node.js скрипт (Рекомендуется)

Я создал `railway-start.js`, который:
1. Проверяет наличие переменных окружения
2. Явно передает их в подпроцессы
3. Запускает миграции и сервер

### Решение 2: Альтернативная команда запуска

В Railway попробуйте установить Start Command напрямую:
```bash
cd backend && DATABASE_URL=$DATABASE_URL npx prisma migrate deploy && npm start
```

### Решение 3: Использовать bash скрипт

Файл `start.sh` уже создан и делает то же самое.

### Решение 4: Проверьте Railway Variables

1. Убедитесь, что в Railway Variables есть:
   - `DATABASE_URL` (не пустая)
   - Нет опечаток в названии
   - Значение начинается с `postgresql://`

2. Проверьте в логах Railway:
   ```
   Environment check:
   - DATABASE_URL: Set или Not set
   ```

### Решение 5: Временный обход

Если ничего не помогает, попробуйте:

1. Закомментируйте миграции в start команде:
   ```json
   "start": "cd backend && npm start"
   ```

2. Запустите миграции вручную через Railway Shell:
   ```bash
   railway run npx prisma migrate deploy
   ```

3. После этого перезапустите сервис

## Проверка переменных

В Railway Shell выполните:
```bash
railway run env | grep DATABASE_URL
```

Если переменная есть, но Prisma её не видит, проблема в передаче переменных в подпроцесс.

## Альтернатива: Использовать директ URL

Вместо template variable попробуйте прямой URL:
```
DATABASE_URL=postgresql://postgres:password@postgres.railway.internal:5432/railway
```

Это должно решить проблему!