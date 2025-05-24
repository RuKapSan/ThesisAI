# ThesisAI - Academic Writing Assistant

AI-powered web service for writing and editing academic papers with intelligent assistance.

## Features

- **Smart Editor**: Markdown editor with live preview, autosave, and version history
- **AI Assistant**: Grammar checking, content generation, and style improvements
- **Plagiarism Check**: Built-in plagiarism detection with detailed reports
- **Document Management**: Organize and track your academic papers
- **Export Options**: Export to PDF, DOCX, and other formats

## Tech Stack

### Frontend
- Next.js 14 with TypeScript
- TailwindCSS for styling
- TipTap for rich text editing
- Zustand for state management

### Backend
- Node.js with Express
- PostgreSQL database with Prisma ORM
- Redis for caching
- OpenAI API integration
- JWT authentication

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Add your OpenAI API key and database credentials

4. Start the database:
   ```bash
   docker-compose up postgres redis
   ```

5. Run database migrations:
   ```bash
   cd backend
   npm run prisma:migrate
   ```

6. Start development servers:
   ```bash
   npm run dev
   ```

## Railway Deployment

1. Create a new project on [Railway](https://railway.app)

2. Add PostgreSQL and Redis services from the Railway dashboard

3. Deploy using Railway CLI:
   ```bash
   railway login
   railway link
   railway up
   ```

4. Set environment variables in Railway dashboard:
   - `DATABASE_URL` (automatically set by Railway PostgreSQL)
   - `REDIS_URL` (automatically set by Railway Redis)
   - `OPENAI_API_KEY` (your OpenAI API key)
   - `JWT_SECRET` (generate a secure random string)
   - `NEXT_PUBLIC_API_URL` (your backend URL)

5. The app will be available at your Railway domain

## Docker Deployment

Build and run with Docker Compose:
```bash
docker-compose up --build
```

## Environment Variables

### Backend
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `OPENAI_API_KEY`: OpenAI API key for AI features
- `PORT`: Server port (default: 3001)

### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/documents` - List user documents
- `POST /api/documents` - Create new document
- `PUT /api/documents/:id` - Update document
- `POST /api/ai/check` - Check text (grammar, style, logic)
- `POST /api/ai/generate` - Generate content
- `POST /api/plagiarism/check` - Run plagiarism check

## License

MIT