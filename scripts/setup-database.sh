#!/bin/bash

# ThesisAI Database Setup Script

echo "🔧 Setting up ThesisAI database..."

# Create backend .env if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env file..."
    cat > backend/.env << EOF
# Server
PORT=3001
NODE_ENV=development

# Database - Using default PostgreSQL credentials
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/thesisai"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="development-secret-key-$(openssl rand -hex 16)"
JWT_EXPIRE="7d"

# OpenAI
OPENAI_API_KEY="your-openai-api-key"

# CORS
FRONTEND_URL="http://localhost:3000"

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH="./uploads"
EOF
    echo "✅ Created backend/.env file"
    echo "⚠️  Please update OPENAI_API_KEY in backend/.env"
fi

# Install backend dependencies if needed
cd backend
if [ ! -d "node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    npm install
fi

# Install missing type definitions
echo "📦 Installing missing TypeScript types..."
npm install --save-dev @types/node

# Generate Prisma client
echo "🔨 Generating Prisma client..."
npm run prisma:generate

# Create database if it doesn't exist
echo "🗄️ Creating database..."
npx prisma db push --skip-generate

# Run migrations
echo "🔄 Running database migrations..."
npm run prisma:migrate

echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Make sure PostgreSQL is running on localhost:5432"
echo "2. Update OPENAI_API_KEY in backend/.env"
echo "3. Run: npm run dev"