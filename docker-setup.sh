#!/bin/bash

echo "Setting up ThesisAI with Docker..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cat > .env << EOF
# Database
DATABASE_URL=postgresql://thesisai:thesisai_password@localhost:5432/thesisai

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# OpenAI
OPENAI_API_KEY=your-openai-api-key-here

# Redis
REDIS_URL=redis://localhost:6379

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Backend URL (for frontend)
NEXT_PUBLIC_API_URL=http://localhost:3001/api
EOF
    echo "✅ .env file created. Please update OPENAI_API_KEY and JWT_SECRET!"
fi

# Stop any existing containers
echo "Stopping existing containers..."
docker-compose down

# Build images
echo "Building Docker images..."
docker-compose build

# Start services
echo "Starting services..."
docker-compose up -d

# Wait for postgres to be ready
echo "Waiting for PostgreSQL to be ready..."
until docker-compose exec postgres pg_isready -U thesisai; do
    echo "PostgreSQL is not ready yet..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Check backend logs
echo ""
echo "Backend logs:"
docker-compose logs backend --tail 20

echo ""
echo "✅ Setup complete!"
echo ""
echo "Services running at:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://localhost:3001"
echo "  - PostgreSQL: localhost:5432"
echo "  - Redis: localhost:6379"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"