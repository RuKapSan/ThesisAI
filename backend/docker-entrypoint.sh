#!/bin/sh

echo "Waiting for database to be ready..."

# Simple connection test
until nc -z postgres 5432; do
  echo "Database is not ready yet... retrying in 2 seconds"
  sleep 2
done

echo "Database is ready!"

# Run migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting backend server..."
npm run start