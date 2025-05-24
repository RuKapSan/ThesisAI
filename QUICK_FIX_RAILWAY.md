# Быстрое решение для Railway

## Проблема
Ваш `DATABASE_URL` = `${{Postgres.DATABASE_URL}}` не работает, потому что у вас нет PostgreSQL сервиса в Railway проекте.

## Решение 1: Добавьте PostgreSQL в Railway (2 минуты)

1. Откройте ваш проект в Railway
2. Нажмите большую кнопку **"+ New"**
3. Выберите **"Database"**
4. Выберите **"PostgreSQL"**
5. Подождите пока PostgreSQL развернется
6. Повторите для **Redis**
7. Ваше приложение автоматически перезапустится и заработает!

## Решение 2: Используйте бесплатную внешнюю БД (5 минут)

### Supabase (Рекомендую)
1. Зайдите на https://supabase.com
2. Создайте новый проект (бесплатно)
3. В разделе Settings → Database скопируйте "Connection string"
4. В Railway замените `${{Postgres.DATABASE_URL}}` на эту строку

### Для Redis - Upstash
1. Зайдите на https://upstash.com
2. Создайте Redis database (бесплатно)
3. Скопируйте Redis URL
4. В Railway замените `${{Redis.REDIS_URL}}` на эту строку

## Что нужно изменить в Railway Variables:

Замените template variables на реальные URL:

```
# Было:
DATABASE_URL=${{Postgres.DATABASE_URL}}
REDIS_URL=${{Redis.REDIS_URL}}

# Стало (пример):
DATABASE_URL=postgresql://user:password@db.supabase.co:5432/postgres
REDIS_URL=redis://default:password@redis.upstash.io:6379
```

## Проверка

После изменения переменных:
1. Приложение автоматически перезапустится
2. В логах должно появиться:
   ```
   ✅ Database connected
   🚀 Server running on port 3001
   ```

## Важно!

Не забудьте также установить:
- `JWT_SECRET` = любая случайная строка (например: `my-super-secret-key-123`)
- `JWT_EXPIRE` = `7d`
- `OPENAI_API_KEY` = ваш ключ от OpenAI

Это самые быстрые способы запустить приложение!