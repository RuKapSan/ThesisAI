#!/bin/bash

# Создаем .env файл из переменных окружения для Prisma
echo "Creating .env file for Prisma..."
cat > backend/.env << EOF
DATABASE_URL=$DATABASE_URL
REDIS_URL=$REDIS_URL
JWT_SECRET=$JWT_SECRET
OPENAI_API_KEY=$OPENAI_API_KEY
NODE_ENV=$NODE_ENV
EOF

echo "Building application..."
npm run build