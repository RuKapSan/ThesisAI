# Frontend Environment Variable Fix

## Problem
Frontend is still using `http://localhost:3001/api` instead of the production backend URL.

## Solution
1. **Frontend Dockerfile updated** to accept build-time environment variable:
   ```dockerfile
   ARG NEXT_PUBLIC_API_URL
   ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
   ```

2. **railway.json updated** to pass build args:
   ```json
   "buildArgs": {
     "NEXT_PUBLIC_API_URL": "${{NEXT_PUBLIC_API_URL}}"
   }
   ```

## Required Environment Variables

### Frontend Service (Railway)
```
NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app/api
```

### Backend Service (Railway)
```
FRONTEND_URL=https://your-frontend-service.railway.app
```

## Important Notes
- In Next.js, `NEXT_PUBLIC_*` variables are embedded at build time, not runtime
- The frontend needs to rebuild after setting the environment variable
- Backend CORS is already configured to use `FRONTEND_URL` environment variable

## Steps to Fix
1. In Railway Frontend Service:
   - Add `NEXT_PUBLIC_API_URL` with your backend URL
   - Trigger a new deployment

2. In Railway Backend Service:
   - Add `FRONTEND_URL` with your frontend URL
   - This allows CORS to work properly