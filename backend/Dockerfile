FROM node:18-alpine AS builder

WORKDIR /app

# Copy root package files for workspace setup
COPY package*.json ./
COPY backend/package.json ./backend/

# Install all dependencies (workspace-aware)
RUN npm install

# Copy backend source
COPY backend/prisma ./backend/prisma/
COPY backend/tsconfig.json ./backend/
COPY backend/src ./backend/src/

# Generate Prisma client with a dummy DATABASE_URL
ENV DATABASE_URL="postgresql://user:pass@host:5432/db"
WORKDIR /app/backend
RUN npx prisma generate

# Build TypeScript
RUN npm run build

FROM node:18-alpine

WORKDIR /app

# Install dependencies for Prisma and health checks
RUN apk add --no-cache openssl libssl3 netcat-openbsd

# Copy package files
COPY package*.json ./
COPY backend/package.json ./backend/

# Install production dependencies only
RUN npm install --omit=dev

# Install Prisma CLI in production for migrations
WORKDIR /app/backend
RUN npm install prisma

# Copy built files and Prisma client
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY backend/prisma ./prisma

# Copy entrypoint script
COPY backend/docker-entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 3001

CMD ["./entrypoint.sh"]