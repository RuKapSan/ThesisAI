#!/bin/sh

# Экспортируем переменные окружения явно
export DATABASE_URL=$DATABASE_URL
export REDIS_URL=$REDIS_URL
export JWT_SECRET=$JWT_SECRET
export OPENAI_API_KEY=$OPENAI_API_KEY

echo "DATABASE_URL is set: ${DATABASE_URL:+Yes}"

# Переходим в backend и запускаем миграции
cd backend

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting backend server..."
npm start