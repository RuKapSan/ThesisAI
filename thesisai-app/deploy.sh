#!/bin/bash

# ThesisAI Railway Deployment Script

echo "🚀 Starting ThesisAI deployment to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "npm install -g @railway/cli"
    exit 1
fi

# Login to Railway
echo "📝 Logging into Railway..."
railway login

# Link to project (create new if not linked)
echo "🔗 Linking Railway project..."
railway link

# Deploy backend
echo "🔧 Deploying backend service..."
cd backend
railway up --service backend

# Deploy frontend
echo "🎨 Deploying frontend service..."
cd ../frontend
railway up --service frontend

echo "✅ Deployment complete!"
echo "📌 Don't forget to set environment variables in Railway dashboard:"
echo "   - OPENAI_API_KEY"
echo "   - JWT_SECRET"
echo "   - NEXT_PUBLIC_API_URL"