# Docker Setup Guide

## Prerequisites
- Docker and Docker Compose installed
- At least 4GB of available RAM

## Quick Start

1. **Run the setup script:**
   ```bash
   ./scripts/docker-setup.sh
   ```

2. **Update environment variables:**
   Edit the `.env` file and update:
   - `OPENAI_API_KEY`: Your OpenAI API key
   - `JWT_SECRET`: A secure secret key for JWT tokens

## Manual Setup

1. **Create `.env` file:**
   ```bash
   cp .env.example .env
   # Edit .env and update the values
   ```

2. **Build and start services:**
   ```bash
   docker-compose build
   docker-compose up -d
   ```

3. **Check logs:**
   ```bash
   docker-compose logs -f
   ```

## Services

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
  - User: thesisai
  - Password: thesisai_password
  - Database: thesisai
- **Redis**: localhost:6379

## Common Commands

### View logs
```bash
docker-compose logs -f          # All services
docker-compose logs -f backend  # Backend only
docker-compose logs -f frontend # Frontend only
```

### Stop services
```bash
docker-compose down
```

### Rebuild after code changes
```bash
docker-compose build
docker-compose up -d
```

### Access database
```bash
docker-compose exec postgres psql -U thesisai
```

### Run migrations manually
```bash
docker-compose exec backend npx prisma migrate deploy
```

## Troubleshooting

### Database connection errors
1. Ensure PostgreSQL container is running:
   ```bash
   docker-compose ps
   ```

2. Check PostgreSQL logs:
   ```bash
   docker-compose logs postgres
   ```

3. Wait for database to be ready:
   ```bash
   docker-compose exec postgres pg_isready -U thesisai
   ```

### Port conflicts
If ports are already in use, either:
1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`

### Memory issues
Increase Docker's memory allocation in Docker Desktop settings.

## Development vs Production

### Development
- Uses local `.env` file
- Hot reloading enabled
- Source maps included

### Production (Railway)
- Environment variables set in Railway dashboard
- Optimized builds
- No source maps

## Environment Variables

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret for JWT tokens
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `REDIS_URL`: Redis connection string

Optional variables:
- `JWT_EXPIRE`: Token expiration (default: 7d)
- `NODE_ENV`: Environment (development/production)
- `PORT`: Backend port (default: 3001)