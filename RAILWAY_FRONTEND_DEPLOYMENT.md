# Frontend Deployment on Railway

The frontend is currently not being deployed because Railway needs separate services for frontend and backend.

## Current Setup
- Backend is deployed as the main service running on port 8080
- Frontend needs to be deployed as a separate Railway service

## How to Deploy Frontend on Railway

1. **Create a new Railway service** for the frontend:
   - Go to your Railway project dashboard
   - Click "New Service" → "GitHub Repo"
   - Select the same repository
   - Set the root directory to `/frontend`

2. **Configure the frontend service**:
   - Add these environment variables:
     ```
     NEXT_PUBLIC_API_URL=https://your-backend-service.railway.app/api
     PORT=3000
     ```
   - Replace `your-backend-service` with your actual backend service URL

3. **Update the frontend build command** (if needed):
   ```json
   {
     "buildCommand": "npm install && npm run build",
     "startCommand": "npm start"
   }
   ```

## Alternative: Single Service Deployment

If you want to run both frontend and backend from a single Railway service:

1. The `railway-start.js` has been updated to start both services
2. You need to expose multiple ports (8080 for backend, 3000 for frontend)
3. Railway only supports one exposed port per service, so you'd need a reverse proxy

## Recommended Approach

Deploy as two separate Railway services:
- **Backend Service**: Runs the API on port 8080
- **Frontend Service**: Runs the Next.js app on port 3000

This is the standard approach for Railway deployments and provides better scalability and separation of concerns.