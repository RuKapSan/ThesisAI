#!/bin/bash

echo "🔧 Fixing ThesisAI setup issues..."

# 1. Create .env file with PostgreSQL default credentials
if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    sed -i 's/user:password/postgres:postgres/g' backend/.env
    echo "✅ Created backend/.env with default PostgreSQL credentials"
fi

# 2. Install dependencies and generate Prisma client
cd backend
echo "📦 Installing backend dependencies..."
npm install

echo "🔨 Generating Prisma client..."
npx prisma generate

# 3. Create database
echo "🗄️ Creating database (if needed)..."
npx prisma db push --skip-generate

echo "✅ Setup complete!"
echo ""
echo "⚠️  IMPORTANT:"
echo "1. Make sure PostgreSQL is running with:"
echo "   - Username: postgres"
echo "   - Password: postgres"
echo "   - Or update DATABASE_URL in backend/.env"
echo ""
echo "2. Add your OpenAI API key to backend/.env"
echo ""
echo "3. Run the app with: npm run dev"