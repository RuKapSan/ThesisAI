# ThesisAI - Полная документация

## Содержание

1. [Обзор проекта](#обзор-проекта)
2. [Архитектура](#архитектура)
3. [Установка и запуск](#установка-и-запуск)
4. [Развертывание](#развертывание)
5. [API документация](#api-документация)
6. [Компоненты фронтенда](#компоненты-фронтенда)
7. [База данных](#база-данных)
8. [Функциональность](#функциональность)
9. [Тестирование](#тестирование)
10. [Решение проблем](#решение-проблем)

## Обзор проекта

ThesisAI - это веб-сервис для написания и редактирования академических работ с помощью AI-ассистента. Сервис помогает студентам структурировать, писать и проверять курсовые и дипломные работы.

### Основные возможности

- **Умный редактор** с поддержкой Markdown и живым превью
- **AI-ассистент** для проверки грамматики, стиля и генерации контента
- **Проверка оригинальности** с детальными отчетами
- **Динамическая структура документа** с навигацией по разделам
- **Версионирование** и автосохранение
- **Экспорт** в различные форматы (PDF, DOCX)

## Архитектура

### Технологический стек

#### Backend
- **Node.js** + **Express** - серверная платформа
- **TypeScript** - типизированный JavaScript
- **PostgreSQL** - основная база данных
- **Redis** - кеширование и сессии
- **Prisma ORM** - работа с базой данных
- **OpenAI API** - интеграция с AI
- **JWT** - аутентификация

#### Frontend
- **Next.js 14** - React фреймворк
- **TypeScript** - типизация
- **TailwindCSS** - стилизация
- **Zustand** - управление состоянием
- **TipTap** - редактор текста
- **React Query** - работа с API

### Структура проекта

```
thesisai-app/
├── backend/                    # Backend API
│   ├── src/
│   │   ├── index.ts           # Точка входа сервера
│   │   ├── routes/            # API маршруты
│   │   │   ├── auth.ts        # Аутентификация
│   │   │   ├── documents.ts   # Работа с документами
│   │   │   ├── ai.ts          # AI функции
│   │   │   └── plagiarism.ts  # Проверка плагиата
│   │   ├── middleware/        # Middleware
│   │   │   ├── auth.ts        # JWT проверка
│   │   │   └── errorHandler.ts
│   │   ├── services/          # Бизнес-логика
│   │   └── utils/             # Утилиты
│   ├── prisma/
│   │   └── schema.prisma      # Схема БД
│   ├── test/                  # Тесты
│   └── Dockerfile
│
├── frontend/                   # Frontend приложение
│   ├── app/                   # Next.js App Router
│   │   ├── page.tsx          # Главная страница
│   │   ├── login/            # Страница входа
│   │   ├── register/         # Регистрация
│   │   ├── dashboard/        # Личный кабинет
│   │   └── editor/[id]/      # Редактор документа
│   ├── components/           # React компоненты
│   │   ├── Editor.tsx        # Текстовый редактор
│   │   ├── AIAssistant.tsx   # AI ассистент
│   │   ├── PlagiarismChecker.tsx
│   │   └── DocumentStructure.tsx
│   ├── lib/                  # Библиотеки
│   │   ├── api.ts           # API клиент
│   │   └── store.ts         # Zustand хранилище
│   └── Dockerfile
│
├── docker-compose.yml        # Docker конфигурация
├── package.json             # Корневой package.json
└── README.md               # Краткое описание
```

## Установка и запуск

### Требования

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker (опционально)

### Локальная разработка

1. **Клонирование репозитория**
```bash
git clone <repository-url>
cd thesisai-app
```

2. **Установка зависимостей**
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

3. **Настройка окружения**

Создайте файл `backend/.env`:
```env
PORT=3001
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/thesisai"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-secret-key"
OPENAI_API_KEY="sk-your-openai-key"
FRONTEND_URL="http://localhost:3000"
```

4. **Запуск базы данных**
```bash
# С Docker
docker-compose up -d postgres redis

# Или установите PostgreSQL и Redis локально
```

5. **Миграции базы данных**
```bash
cd backend
npx prisma migrate dev
```

6. **Запуск приложения**
```bash
# В корневой директории
npm run dev
```

Приложение будет доступно:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Docker запуск

```bash
docker-compose up --build
```

## Развертывание

### Railway

1. **Подготовка**
```bash
# Генерация package-lock.json
npm install

# Проверка конфигурации
cat railway.toml
```

2. **Развертывание**
```bash
railway login
railway link
railway up
```

3. **Переменные окружения в Railway**
- `DATABASE_URL` - автоматически от Railway PostgreSQL
- `REDIS_URL` - автоматически от Railway Redis
- `OPENAI_API_KEY` - ваш ключ OpenAI
- `JWT_SECRET` - сгенерировать: `openssl rand -base64 32`
- `NEXT_PUBLIC_API_URL` - URL вашего backend сервиса

### Решение проблем с Railway

Если возникает ошибка `npm ci`:
```bash
# Убедитесь что есть package-lock.json
npm install

# Коммит изменений
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

## API документация

### Аутентификация

#### POST /api/auth/register
Регистрация нового пользователя
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "Имя Пользователя"
}
```

#### POST /api/auth/login
Вход в систему
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Документы

#### GET /api/documents
Получить список документов пользователя

#### POST /api/documents
Создать новый документ
```json
{
  "title": "Название документа",
  "content": "# Содержание",
  "type": "COURSEWORK"
}
```

#### PUT /api/documents/:id
Обновить документ
```json
{
  "title": "Новое название",
  "content": "# Новое содержание"
}
```

#### DELETE /api/documents/:id
Удалить документ

### AI функции

#### POST /api/ai/check
Проверка текста
```json
{
  "text": "Текст для проверки",
  "type": "grammar" // grammar, style, logic, facts
}
```

#### POST /api/ai/generate
Генерация контента
```json
{
  "prompt": "Запрос",
  "context": "Контекст документа",
  "type": "continue" // continue, rephrase, outline, introduction, conclusion
}
```

#### POST /api/ai/sources
Поиск источников
```json
{
  "topic": "Тема исследования",
  "count": 5
}
```

#### POST /api/ai/analyze-structure
Анализ структуры документа
```json
{
  "content": "Содержание документа"
}
```

### Проверка плагиата

#### POST /api/plagiarism/check
Запустить проверку
```json
{
  "documentId": "uuid-документа"
}
```

#### GET /api/plagiarism/history/:documentId
История проверок документа

#### GET /api/plagiarism/report/:checkId
Детальный отчет о проверке

## Компоненты фронтенда

### Editor
Основной текстовый редактор на базе TipTap
- Поддержка Markdown
- Панель инструментов форматирования
- Вставка изображений и таблиц
- Подсветка синтаксиса кода

### AIAssistant
AI-помощник с функциями:
- Проверка грамматики и стиля
- Генерация текста
- Поиск источников
- Анализ структуры
- Поддержка выделенного текста
- Окно ввода промпта

### DocumentStructure
Динамическая структура документа:
- Автоматический парсинг заголовков
- Навигация по разделам
- Рекомендуемая структура
- Счетчики разделов

### PlagiarismChecker
Проверка оригинальности:
- Визуализация результатов
- История проверок
- Детальный анализ сегментов
- Цветовая индикация

## База данных

### Схема данных

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String
  role      UserRole @default(STUDENT)
  documents Document[]
}

model Document {
  id          String   @id @default(uuid())
  title       String
  content     String   @db.Text
  type        DocType
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  versions    DocumentVersion[]
  checks      PlagiarismCheck[]
}

model DocumentVersion {
  id         String   @id @default(uuid())
  documentId String
  content    String   @db.Text
  version    Int
  createdAt  DateTime @default(now())
}

model PlagiarismCheck {
  id               String   @id @default(uuid())
  documentId       String
  originalityScore Float
  report           Json
  checkedAt        DateTime @default(now())
}
```

### Миграции

```bash
# Создать новую миграцию
npx prisma migrate dev --name migration_name

# Применить миграции в продакшене
npx prisma migrate deploy

# Сбросить базу данных (осторожно!)
npx prisma migrate reset
```

## Функциональность

### Работа с текстом

1. **Выделение текста**
   - Выделите фрагмент в редакторе
   - Перейдите в AI Ассистент
   - Выделенный текст автоматически используется

2. **AI запросы**
   - Выберите действие (проверка, генерация)
   - Введите дополнительные инструкции
   - Нажмите "Выполнить"

3. **Автосохранение**
   - Каждые 30 секунд
   - При изменении контента
   - Индикация последнего сохранения

### Структура документа

- Автоматически обновляется при добавлении заголовков
- Клик по заголовку прокручивает к нему
- Показывает иерархию разделов

### Проверка оригинальности

- Симулированная проверка (в MVP)
- Цветовая индикация результатов:
  - Зеленый: >90% оригинальности
  - Желтый: 70-90%
  - Красный: <70%

## Тестирование

### Запуск тестов

```bash
# Все тесты
npm run test:all

# Backend тесты
npm run test:backend

# Frontend тесты
npm run test:frontend

# E2E тесты
npm run test:e2e

# С покрытием
npm run test:coverage
```

### Структура тестов

- **Unit тесты**: Изолированное тестирование функций
- **Integration тесты**: Тестирование API endpoints
- **Component тесты**: React компоненты
- **E2E тесты**: Полные пользовательские сценарии

## Решение проблем

### Частые проблемы

1. **Ошибка подключения к БД**
   - Проверьте что PostgreSQL запущен
   - Проверьте DATABASE_URL в .env
   - Попробуйте `npx prisma db push`

2. **Ошибка npm ci на Railway**
   - Убедитесь что есть package-lock.json
   - Закоммитьте его в репозиторий

3. **Ошибки TypeScript**
   - Удалите node_modules
   - Запустите `npm install`
   - Проверьте tsconfig.json

4. **Проблемы с Redis**
   - Проверьте что Redis запущен
   - Проверьте REDIS_URL в .env

### Логи и отладка

```bash
# Просмотр логов Docker
docker-compose logs -f

# Логи Railway
railway logs

# Отладка Prisma
DEBUG=* npx prisma studio
```

### Контакты поддержки

- GitHub Issues: [репозиторий]/issues
- Email: support@thesisai.com

## Лицензия

MIT License - см. файл LICENSE