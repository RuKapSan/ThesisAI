#!/bin/bash

# ThesisAI Development Setup Script

echo "🚀 Starting ThesisAI development environment..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Start database services
echo "🗄️ Starting PostgreSQL and Redis..."
docker-compose up -d postgres redis

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 5

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Setup backend
cd backend
if [ ! -f ".env" ]; then
    echo "📝 Creating backend .env file..."
    cp .env.example .env
    echo "⚠️  Please update backend/.env with your OPENAI_API_KEY"
fi

# Run migrations
echo "🔧 Running database migrations..."
npm run prisma:migrate

# Start development servers
cd ..
echo "🎯 Starting development servers..."
npm run dev