# ThesisAI API Reference

## Базовый URL

```
Production: https://your-app.railway.app/api
Development: http://localhost:3001/api
```

## Аутентификация

Все защищенные endpoints требуют JWT токен в заголовке:
```
Authorization: Bearer <token>
```

## Endpoints

### Auth - Аутентификация

#### Регистрация пользователя
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "Иван Иванов"
}
```

**Успешный ответ (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Иван Иванов",
    "role": "STUDENT"
  }
}
```

**Ошибки:**
- `400` - Невалидные данные или email уже существует
- `500` - Ошибка сервера

#### Вход в систему
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Успешный ответ (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Иван Иванов",
    "role": "STUDENT"
  }
}
```

**Ошибки:**
- `401` - Неверный email или пароль
- `400` - Невалидные данные

### Documents - Документы

#### Получить список документов
```http
GET /documents
Authorization: Bearer <token>
```

**Успешный ответ (200):**
```json
[
  {
    "id": "uuid",
    "title": "Курсовая работа",
    "type": "COURSEWORK",
    "updatedAt": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Получить документ
```http
GET /documents/:id
Authorization: Bearer <token>
```

**Успешный ответ (200):**
```json
{
  "id": "uuid",
  "title": "Курсовая работа",
  "content": "# Введение\n\nТекст документа...",
  "type": "COURSEWORK",
  "userId": "user-uuid",
  "isPublic": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "versions": [
    {
      "id": "version-uuid",
      "version": 1,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Ошибки:**
- `404` - Документ не найден
- `401` - Нет доступа

#### Создать документ
```http
POST /documents
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Новая курсовая работа",
  "content": "# Введение\n\n",
  "type": "COURSEWORK"
}
```

**Типы документов:**
- `COURSEWORK` - Курсовая работа
- `THESIS` - Дипломная работа
- `ESSAY` - Эссе
- `REPORT` - Отчет
- `ARTICLE` - Статья

**Успешный ответ (200):**
```json
{
  "id": "new-uuid",
  "title": "Новая курсовая работа",
  "content": "# Введение\n\n",
  "type": "COURSEWORK",
  "userId": "user-uuid",
  "isPublic": false,
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### Обновить документ
```http
PUT /documents/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Обновленное название",
  "content": "# Новое содержание"
}
```

**Успешный ответ (200):**
```json
{
  "id": "uuid",
  "title": "Обновленное название",
  "content": "# Новое содержание",
  // ... остальные поля
}
```

#### Удалить документ
```http
DELETE /documents/:id
Authorization: Bearer <token>
```

**Успешный ответ (200):**
```json
{
  "message": "Document deleted successfully"
}
```

### AI - Искусственный интеллект

#### Проверка текста
```http
POST /ai/check
Authorization: Bearer <token>
Content-Type: application/json

{
  "text": "Текст для проверки",
  "type": "grammar"
}
```

**Типы проверок:**
- `grammar` - Грамматика и орфография
- `style` - Научный стиль
- `logic` - Логика изложения
- `facts` - Проверка фактов

**Успешный ответ (200):**
```json
{
  "type": "grammar",
  "feedback": "Обнаружены следующие ошибки:\n1. Пропущена запятая в предложении...\n2. Неправильное склонение..."
}
```

#### Генерация контента
```http
POST /ai/generate
Authorization: Bearer <token>
Content-Type: application/json

{
  "prompt": "Напиши введение о глобальном потеплении",
  "context": "Это курсовая работа по экологии",
  "type": "introduction"
}
```

**Типы генерации:**
- `continue` - Продолжить текст
- `rephrase` - Перефразировать
- `outline` - Создать план
- `introduction` - Написать введение
- `conclusion` - Написать заключение

**Успешный ответ (200):**
```json
{
  "type": "introduction",
  "generated": "Глобальное потепление представляет собой одну из наиболее актуальных проблем современности..."
}
```

#### Поиск источников
```http
POST /ai/sources
Authorization: Bearer <token>
Content-Type: application/json

{
  "topic": "Искусственный интеллект в образовании",
  "count": 5
}
```

**Успешный ответ (200):**
```json
{
  "topic": "Искусственный интеллект в образовании",
  "sources": "1. Иванов И.И. (2023). 'Применение ИИ в высшем образовании'. Журнал образовательных технологий...\n2. Smith J. (2022). 'AI in Education: A Comprehensive Review'..."
}
```

#### Анализ структуры
```http
POST /ai/analyze-structure
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "# Введение\n\nТекст введения...\n\n# Заключение\n\nТекст заключения..."
}
```

**Успешный ответ (200):**
```json
{
  "analysis": "Анализ структуры документа:\n\n1. Отсутствует основная часть между введением и заключением\n2. Рекомендуется добавить разделы: Теоретическая часть, Практическая часть\n3. Объем введения составляет 15% от общего объема - это соответствует рекомендациям"
}
```

### Plagiarism - Проверка плагиата

#### Запустить проверку
```http
POST /plagiarism/check
Authorization: Bearer <token>
Content-Type: application/json

{
  "documentId": "document-uuid"
}
```

**Успешный ответ (200):**
```json
{
  "id": "check-uuid",
  "originalityScore": 0.87,
  "report": {
    "originalityScore": 0.87,
    "totalWords": 1500,
    "checkedSegments": 15,
    "flaggedSegments": 2,
    "segments": [
      {
        "index": 0,
        "text": "Первый параграф текста...",
        "isOriginal": true,
        "similarity": 0
      },
      {
        "index": 3,
        "text": "Подозрительный фрагмент...",
        "isOriginal": false,
        "similarity": 0.25
      }
    ]
  },
  "checkedAt": "2024-01-01T00:00:00Z"
}
```

#### История проверок
```http
GET /plagiarism/history/:documentId
Authorization: Bearer <token>
```

**Успешный ответ (200):**
```json
[
  {
    "id": "check-uuid-1",
    "originalityScore": 0.87,
    "checkedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "check-uuid-2",
    "originalityScore": 0.92,
    "checkedAt": "2024-01-02T00:00:00Z"
  }
]
```

#### Детальный отчет
```http
GET /plagiarism/report/:checkId
Authorization: Bearer <token>
```

**Успешный ответ (200):**
```json
{
  "id": "check-uuid",
  "documentTitle": "Курсовая работа",
  "originalityScore": 0.87,
  "report": {
    // Полный отчет как в POST /plagiarism/check
  },
  "checkedAt": "2024-01-01T00:00:00Z"
}
```

## Коды ошибок

| Код | Описание |
|-----|----------|
| 200 | Успешный запрос |
| 400 | Невалидные данные запроса |
| 401 | Не авторизован или невалидный токен |
| 404 | Ресурс не найден |
| 429 | Превышен лимит запросов |
| 500 | Внутренняя ошибка сервера |

## Лимиты

- Максимальный размер документа: 10MB
- Лимит запросов: 100 запросов в минуту
- Максимальная длина текста для AI: 10000 символов
- Максимальное количество документов (Free план): 5

## Примеры использования

### JavaScript/TypeScript
```typescript
// Создание документа
const response = await fetch('http://localhost:3001/api/documents', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Моя курсовая работа',
    content: '# Введение',
    type: 'COURSEWORK'
  })
});

const document = await response.json();
```

### Python
```python
import requests

# Проверка текста
headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

data = {
    'text': 'Текст для проверки',
    'type': 'grammar'
}

response = requests.post(
    'http://localhost:3001/api/ai/check',
    headers=headers,
    json=data
)

result = response.json()
```

### cURL
```bash
# Получить список документов
curl -X GET http://localhost:3001/api/documents \
  -H "Authorization: Bearer <token>"

# Создать документ
curl -X POST http://localhost:3001/api/documents \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Новый документ",
    "content": "# Содержание",
    "type": "ESSAY"
  }'
```