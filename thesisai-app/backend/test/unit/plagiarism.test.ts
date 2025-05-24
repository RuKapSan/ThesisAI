import request from 'supertest';
import express from 'express';
import plagiarismRouter from '../../src/routes/plagiarism';
import { PrismaClient } from '@prisma/client';

// Mock auth middleware
jest.mock('../../src/middleware/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.userId = 'test-user-id';
    req.user = { id: 'test-user-id', role: 'STUDENT' };
    next();
  })
}));

const app = express();
app.use(express.json());
app.use('/plagiarism', plagiarismRouter);

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Plagiarism Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /plagiarism/check', () => {
    it('should run plagiarism check successfully', async () => {
      const mockDocument = {
        id: 'doc1',
        userId: 'test-user-id',
        content: 'This is a test document with some content for plagiarism checking.'
      };

      const mockCheck = {
        id: 'check1',
        documentId: 'doc1',
        originalityScore: 0.85,
        report: {
          originalityScore: 0.85,
          totalWords: 10,
          checkedSegments: 1,
          flaggedSegments: 0,
          segments: []
        },
        checkedAt: new Date()
      };

      (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue(mockDocument);
      (mockPrisma.plagiarismCheck.create as jest.Mock).mockResolvedValue(mockCheck);
      (mockPrisma.document.update as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .post('/plagiarism/check')
        .set('Authorization', 'Bearer mock-token')
        .send({ documentId: 'doc1' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('originalityScore');
      expect(response.body.originalityScore).toBeGreaterThan(0);
      expect(response.body.originalityScore).toBeLessThanOrEqual(1);
    });

    it('should return 404 for non-existent document', async () => {
      (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/plagiarism/check')
        .set('Authorization', 'Bearer mock-token')
        .send({ documentId: 'non-existent' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Document not found');
    });

    it('should validate documentId format', async () => {
      const response = await request(app)
        .post('/plagiarism/check')
        .set('Authorization', 'Bearer mock-token')
        .send({ documentId: 'invalid-uuid' });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('GET /plagiarism/history/:documentId', () => {
    it('should return check history for document', async () => {
      const mockChecks = [
        {
          id: 'check1',
          originalityScore: 0.85,
          checkedAt: new Date('2024-01-01')
        },
        {
          id: 'check2',
          originalityScore: 0.92,
          checkedAt: new Date('2024-01-02')
        }
      ];

      (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue({
        id: 'doc1',
        userId: 'test-user-id'
      });
      (mockPrisma.plagiarismCheck.findMany as jest.Mock).mockResolvedValue(mockChecks);

      const response = await request(app)
        .get('/plagiarism/history/doc1')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('originalityScore');
    });

    it('should return 404 for unauthorized document', async () => {
      (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/plagiarism/history/unauthorized-doc')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Document not found');
    });
  });

  describe('GET /plagiarism/report/:checkId', () => {
    it('should return detailed report', async () => {
      const mockReport = {
        id: 'check1',
        documentId: 'doc1',
        originalityScore: 0.85,
        report: {
          originalityScore: 0.85,
          totalWords: 100,
          checkedSegments: 5,
          flaggedSegments: 1,
          segments: [
            {
              index: 0,
              text: 'This is original content...',
              isOriginal: true,
              similarity: 0
            },
            {
              index: 1,
              text: 'This might be similar...',
              isOriginal: false,
              similarity: 0.25
            }
          ]
        },
        checkedAt: new Date(),
        document: {
          userId: 'test-user-id',
          title: 'Test Document'
        }
      };

      (mockPrisma.plagiarismCheck.findUnique as jest.Mock).mockResolvedValue(mockReport);

      const response = await request(app)
        .get('/plagiarism/report/check1')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('originalityScore', 0.85);
      expect(response.body).toHaveProperty('documentTitle', 'Test Document');
      expect(response.body.report).toHaveProperty('segments');
    });

    it('should return 404 for non-existent report', async () => {
      (mockPrisma.plagiarismCheck.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/plagiarism/report/non-existent')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Report not found');
    });

    it('should return 404 for unauthorized report', async () => {
      (mockPrisma.plagiarismCheck.findUnique as jest.Mock).mockResolvedValue({
        id: 'check1',
        document: {
          userId: 'other-user-id',
          title: 'Other Document'
        }
      });

      const response = await request(app)
        .get('/plagiarism/report/check1')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Report not found');
    });
  });
});