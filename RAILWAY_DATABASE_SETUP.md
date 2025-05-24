# Railway Database Setup Guide

## Problem
Your Railway deployment is failing because there's no PostgreSQL database connected. The `DATABASE_URL` variable is referencing a non-existent Postgres service.

## Solution: Add PostgreSQL to Railway

### Option 1: Add PostgreSQL Service (Recommended)

1. **In Railway Dashboard:**
   - Click "New Service" 
   - Select "Database" → "Add PostgreSQL"
   - This will create a PostgreSQL instance

2. **Connect to your app:**
   - Railway will automatically create the `DATABASE_URL` 
   - The template variable `${{Postgres.DATABASE_URL}}` will now work

3. **Add Redis Service:**
   - Click "New Service" again
   - Select "Database" → "Add Redis"
   - The `${{Redis.REDIS_URL}}` will now work

### Option 2: Use External Database

If you want to use an external database (like Supabase, Neon, etc.):

1. **Remove template variables:**
   - Change `${{Postgres.DATABASE_URL}}` to your actual database URL
   - Change `${{Redis.REDIS_URL}}` to your actual Redis URL

2. **Update variables in Railway:**
   ```
   DATABASE_URL=postgresql://user:password@host:5432/database
   REDIS_URL=redis://user:password@host:6379
   ```

## Required Environment Variables

```env
# Database (use Railway PostgreSQL or external)
DATABASE_URL=postgresql://...

# Redis (use Railway Redis or external) 
REDIS_URL=redis://...

# Application secrets
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d

# OpenAI API
OPENAI_API_KEY=your-openai-api-key

# Environment
NODE_ENV=production

# Frontend URL (add this for CORS)
FRONTEND_URL=https://your-app.railway.app

# API URL for frontend (if deploying frontend separately)
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

## Steps to Fix:

1. **Add PostgreSQL service in Railway**
2. **Add Redis service in Railway**
3. **Update missing variables:**
   - Set `JWT_SECRET` to a secure random string
   - Set `JWT_EXPIRE` to "7d"
   - Make sure `OPENAI_API_KEY` is set correctly

4. **Redeploy your service**

## Alternative: Use Supabase/Neon for Database

If you prefer free PostgreSQL hosting:

### Supabase:
1. Create account at https://supabase.com
2. Create new project
3. Copy connection string from Settings → Database
4. Use the "Connection string" URI

### Neon:
1. Create account at https://neon.tech
2. Create new project
3. Copy connection string
4. Use in DATABASE_URL

### Upstash Redis:
1. Create account at https://upstash.com
2. Create Redis database
3. Copy Redis URL
4. Use in REDIS_URL

## Deployment Command

Once databases are connected, your app should deploy automatically. If not:

```bash
railway up
```

## Verify Services

After adding services, you should see:
- PostgreSQL service in your Railway project
- Redis service in your Railway project
- All template variables resolved (no more ${{}})
- Deployment succeeds

## Important Notes

1. Railway's free tier includes:
   - $5 credit/month
   - PostgreSQL with 1GB storage
   - Redis with 100MB storage

2. Make sure to:
   - Keep `NODE_ENV=production`
   - Use strong JWT_SECRET
   - Don't commit secrets to Git