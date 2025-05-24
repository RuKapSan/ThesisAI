import request from 'supertest';
import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Import all routes
import authRouter from '../../src/routes/auth';
import documentsRouter from '../../src/routes/documents';
import aiRouter from '../../src/routes/ai';
import plagiarismRouter from '../../src/routes/plagiarism';
import { errorHandler } from '../../src/middleware/errorHandler';

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/plagiarism', plagiarismRouter);
app.use(errorHandler);

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('API Integration Tests', () => {
  let authToken: string;
  let userId: string;
  let documentId: string;

  beforeAll(async () => {
    // Setup test data
    userId = 'test-user-id';
    process.env.JWT_SECRET = 'test-secret';
    process.env.OPENAI_API_KEY = 'test-key';
  });

  describe('Complete User Flow', () => {
    it('should complete full user journey from registration to document creation', async () => {
      // 1. Register new user
      const hashedPassword = await bcrypt.hash('password123', 10);
      const newUser = {
        id: userId,
        email: 'integration@test.com',
        password: hashedPassword,
        name: 'Integration Test',
        role: 'STUDENT',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.user.create as jest.Mock).mockResolvedValue(newUser);

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration@test.com',
          password: 'password123',
          name: 'Integration Test'
        });

      expect(registerResponse.status).toBe(200);
      expect(registerResponse.body).toHaveProperty('token');
      authToken = registerResponse.body.token;

      // 2. Login with new credentials
      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(newUser);

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.token).toBeDefined();

      // 3. Create a document
      const newDocument = {
        id: 'doc-123',
        title: 'Integration Test Document',
        content: '# Test Document\n\nThis is a test.',
        type: 'COURSEWORK',
        userId: userId,
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrisma.document.create as jest.Mock).mockResolvedValue(newDocument);
      (mockPrisma.documentVersion.create as jest.Mock).mockResolvedValue({
        id: 'version-1',
        documentId: 'doc-123',
        content: newDocument.content,
        version: 1
      });

      const createDocResponse = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Integration Test Document',
          content: '# Test Document\n\nThis is a test.',
          type: 'COURSEWORK'
        });

      expect(createDocResponse.status).toBe(200);
      expect(createDocResponse.body.id).toBe('doc-123');
      documentId = createDocResponse.body.id;

      // 4. Use AI to check grammar
      const aiCheckResponse = await request(app)
        .post('/api/ai/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          text: 'This are a test sentence.',
          type: 'grammar'
        });

      expect(aiCheckResponse.status).toBe(200);
      expect(aiCheckResponse.body).toHaveProperty('feedback');

      // 5. Run plagiarism check
      (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue(newDocument);
      (mockPrisma.plagiarismCheck.create as jest.Mock).mockResolvedValue({
        id: 'check-1',
        documentId: documentId,
        originalityScore: 0.85,
        report: {
          originalityScore: 0.85,
          totalWords: 10,
          checkedSegments: 1,
          flaggedSegments: 0
        },
        checkedAt: new Date()
      });
      (mockPrisma.document.update as jest.Mock).mockResolvedValue({
        ...newDocument,
        lastChecked: new Date()
      });

      const plagiarismResponse = await request(app)
        .post('/api/plagiarism/check')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ documentId });

      expect(plagiarismResponse.status).toBe(200);
      expect(plagiarismResponse.body.originalityScore).toBeGreaterThan(0);

      // 6. Update document
      (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue(newDocument);
      (mockPrisma.document.update as jest.Mock).mockResolvedValue({
        ...newDocument,
        title: 'Updated Title'
      });
      (mockPrisma.documentVersion.findFirst as jest.Mock).mockResolvedValue({
        version: 1
      });
      (mockPrisma.documentVersion.create as jest.Mock).mockResolvedValue({
        id: 'version-2',
        version: 2
      });

      const updateResponse = await request(app)
        .put(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated Title' });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.title).toBe('Updated Title');

      // 7. Get document list
      (mockPrisma.document.findMany as jest.Mock).mockResolvedValue([newDocument]);

      const listResponse = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${authToken}`);

      expect(listResponse.status).toBe(200);
      expect(listResponse.body).toHaveLength(1);

      // 8. Delete document
      (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue(newDocument);
      (mockPrisma.document.delete as jest.Mock).mockResolvedValue({});

      const deleteResponse = await request(app)
        .delete(`/api/documents/${documentId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(deleteResponse.status).toBe(200);
      expect(deleteResponse.body.message).toBe('Document deleted successfully');
    });
  });

  describe('Error Handling', () => {
    it('should handle unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/documents')
        .expect(401);

      expect(response.body.error).toBe('No token provided');
    });

    it('should handle invalid document types', async () => {
      const response = await request(app)
        .post('/api/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test',
          content: 'Content',
          type: 'INVALID_TYPE'
        })
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.document.findMany as jest.Mock).mockRejectedValue(
        new Error('Database connection failed')
      );

      const response = await request(app)
        .get('/api/documents')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(500);

      expect(response.body.error).toBe('Failed to fetch documents');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle multiple requests within limits', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .get('/api/documents')
          .set('Authorization', `Bearer ${authToken}`)
      );

      const responses = await Promise.all(requests);
      responses.forEach(response => {
        expect(response.status).not.toBe(429);
      });
    });
  });
});