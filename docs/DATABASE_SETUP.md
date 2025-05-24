# Database Setup Guide

## Option 1: Using Docker (Recommended)

```bash
# Start PostgreSQL and Redis with Docker
docker-compose up -d postgres redis

# The database will be available with:
# - Host: localhost
# - Port: 5432
# - Username: thesisai
# - Password: thesisai_password
# - Database: thesisai
```

## Option 2: Local PostgreSQL

If you have PostgreSQL installed locally:

1. **Create database and user:**
```sql
sudo -u postgres psql
CREATE USER thesisai WITH PASSWORD 'thesisai_password';
CREATE DATABASE thesisai OWNER thesisai;
\q
```

2. **Update backend/.env:**
```
DATABASE_URL="postgresql://thesisai:thesisai_password@localhost:5432/thesisai"
```

## Option 3: Use your existing PostgreSQL

1. **Update backend/.env with your credentials:**
```
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/thesisai"
```

2. **Create the database:**
```sql
CREATE DATABASE thesisai;
```

## After Database Setup

```bash
# Generate Prisma client
cd backend
npx prisma generate

# Create tables
npx prisma db push

# Or run migrations
npx prisma migrate dev
```

## Troubleshooting

- **Authentication failed**: Check username/password in DATABASE_URL
- **Connection refused**: Make sure PostgreSQL is running
- **Database does not exist**: Create it manually or let Prisma create it