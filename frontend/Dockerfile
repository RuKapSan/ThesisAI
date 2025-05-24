FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

# Build the application
RUN npm run build

# Check what exists after build
RUN ls -la .next/standalone/

FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy the standalone build output
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./

# Copy static files
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./frontend/.next/static

# Create public directory in the right place
RUN mkdir -p ./frontend/public

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "frontend/server.js"]