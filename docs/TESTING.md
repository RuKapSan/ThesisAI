# ThesisAI Testing Guide

## Overview

ThesisAI includes comprehensive test coverage for both backend and frontend components:

- **Backend**: Unit tests for all API routes, middleware, and services
- **Frontend**: Component tests, page tests, and store tests
- **E2E**: End-to-end tests using Cypress

## Quick Start

```bash
# Install all dependencies including test packages
npm run install:deps

# Run all tests
npm run test:all

# Run with coverage
npm run test:coverage
```

## Backend Testing

### Unit Tests

Located in `backend/test/unit/`:
- `auth.test.ts` - Authentication routes (login, register)
- `documents.test.ts` - Document CRUD operations
- `ai.test.ts` - AI assistant features
- `plagiarism.test.ts` - Plagiarism checking
- `middleware.test.ts` - Auth and error handling middleware

### Running Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run with coverage
npm run test -- --coverage

# Watch mode
npm run test:watch

# Run specific test file
npm test auth.test.ts
```

### Test Coverage

Backend tests cover:
- ✅ All API endpoints
- ✅ Authentication flow
- ✅ Input validation
- ✅ Error handling
- ✅ Database operations (mocked)
- ✅ External API calls (mocked)

## Frontend Testing

### Component Tests

Located in `frontend/__tests__/`:
- `components/Editor.test.tsx` - Rich text editor
- `components/AIAssistant.test.tsx` - AI features UI
- `components/PlagiarismChecker.test.tsx` - Plagiarism UI
- `lib/store.test.ts` - Zustand state management
- `lib/api.test.ts` - API client with interceptors
- `pages/login.test.tsx` - Login page

### Running Frontend Tests

```bash
cd frontend

# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

### E2E Tests

Located in `frontend/cypress/e2e/`:
- `auth.cy.ts` - Authentication flows
- `documents.cy.ts` - Document management

```bash
cd frontend

# Run E2E tests headless
npm run test:e2e

# Open Cypress UI
npm run cypress:open
```

## Test Configuration

### Backend Jest Config

```javascript
// backend/jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  }
};
```

### Frontend Jest Config

```javascript
// frontend/jest.config.js
const nextJest = require('next/jest')
const createJestConfig = nextJest({ dir: './' })
// ... configuration
```

### Cypress Config

```typescript
// frontend/cypress.config.ts
export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    // ... configuration
  }
});
```

## Mocking Strategy

### Backend Mocks
- **Prisma Client**: All database operations
- **OpenAI API**: AI responses
- **JWT**: Token generation/verification

### Frontend Mocks
- **Next.js Router**: Navigation methods
- **Axios**: API calls
- **TipTap Editor**: Rich text editing
- **React Hot Toast**: Notifications

## Writing New Tests

### Backend Test Example

```typescript
describe('New Feature', () => {
  it('should handle request correctly', async () => {
    const response = await request(app)
      .post('/api/new-feature')
      .send({ data: 'test' });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('result');
  });
});
```

### Frontend Test Example

```typescript
describe('NewComponent', () => {
  it('renders correctly', () => {
    render(<NewComponent prop="value" />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });
});
```

### E2E Test Example

```typescript
describe('New Feature E2E', () => {
  it('completes user flow', () => {
    cy.visit('/feature');
    cy.get('button').click();
    cy.contains('Success').should('be.visible');
  });
});
```

## CI/CD Integration

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Install dependencies
  run: npm run install:deps

- name: Run tests
  run: npm run test:all

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## Troubleshooting

### Common Issues

1. **Tests fail with "Cannot find module"**
   - Run `npm run install:deps`
   - Check import paths match file structure

2. **E2E tests timeout**
   - Ensure backend is running: `npm run dev:backend`
   - Check Cypress baseUrl matches your setup

3. **Mock not working**
   - Clear Jest cache: `jest --clearCache`
   - Check mock is defined before import

### Debug Mode

```bash
# Backend tests with debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Frontend tests with debugging
npm test -- --no-coverage --verbose

# Cypress with debugging
DEBUG=cypress:* npm run cypress:open
```

## Test Data

Default test credentials:
- Email: `test@example.com`
- Password: `password123`
- User ID: `test-user-id`
- Document ID: `test-doc-id`

## Coverage Goals

Maintain minimum coverage:
- Statements: 70%
- Branches: 70%
- Functions: 70%
- Lines: 70%

View coverage reports:
- Backend: `backend/coverage/lcov-report/index.html`
- Frontend: `frontend/coverage/lcov-report/index.html`