# ThesisAI - Quick Start Guide

## 🚀 Railway Deployment (Recommended)

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Deploy to Railway**
   ```bash
   ./scripts/deployment/deploy.sh
   ```

3. **Configure Environment Variables in Railway Dashboard**
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `JWT_SECRET` - Generate with: `openssl rand -base64 32`
   - `NEXT_PUBLIC_API_URL` - Your backend URL (provided by Railway)

## 💻 Local Development

1. **Quick Start**
   ```bash
   ./scripts/start-dev.sh
   ```

2. **Manual Setup**
   ```bash
   # Install dependencies
   npm install

   # Start databases
   docker-compose up -d postgres redis

   # Setup backend
   cd backend
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   npm run prisma:migrate

   # Start development
   cd ..
   npm run dev
   ```

3. **Access the app**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

## 📦 Docker Deployment

```bash
docker-compose up --build
```

## 🔑 Required API Keys

- **OpenAI API Key**: Get from https://platform.openai.com/api-keys
- **Database**: Automatically provisioned by Railway/Docker

## 📱 Features

- ✍️ Markdown editor with live preview
- 🤖 AI-powered writing assistance
- 📊 Plagiarism checking
- 📄 Export to PDF/DOCX
- 💾 Auto-save and version history
- 🎨 Dark theme interface

## 🆘 Troubleshooting

- **Port conflicts**: Change ports in `.env` files
- **Database errors**: Run `npm run prisma:migrate` in backend/
- **Build errors**: Delete node_modules and reinstall

## 📝 Default Credentials

No default users. Register a new account at `/register`.