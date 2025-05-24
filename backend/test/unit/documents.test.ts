import request from 'supertest';
import express from 'express';
import documentsRouter from '../../src/routes/documents';
import { PrismaClient } from '@prisma/client';
import { authenticate } from '../../src/middleware/auth';

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
app.use('/documents', documentsRouter);

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Documents Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /documents', () => {
    it('should return user documents', async () => {
      const mockDocuments = [
        {
          id: 'doc1',
          title: 'Document 1',
          type: 'COURSEWORK',
          updatedAt: new Date(),
          createdAt: new Date()
        },
        {
          id: 'doc2',
          title: 'Document 2',
          type: 'THESIS',
          updatedAt: new Date(),
          createdAt: new Date()
        }
      ];

      (mockPrisma.document.findMany as jest.Mock).mockResolvedValue(mockDocuments);

      const response = await request(app)
        .get('/documents')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Document 1');
    });

    it('should handle errors gracefully', async () => {
      (mockPrisma.document.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .get('/documents')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Failed to fetch documents');
    });
  });

  describe('GET /documents/:id', () => {
    it('should return a specific document with versions', async () => {
      const mockDocument = {
        id: 'doc1',
        title: 'Test Document',
        content: '# Test Content',
        type: 'COURSEWORK',
        userId: 'test-user-id',
        versions: [
          { id: 'v1', version: 1, content: '# Initial', createdAt: new Date() }
        ]
      };

      (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue(mockDocument);

      const response = await request(app)
        .get('/documents/doc1')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Test Document');
      expect(response.body.versions).toHaveLength(1);
    });

    it('should return 404 for non-existent document', async () => {
      (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .get('/documents/non-existent')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Document not found');
    });
  });

  describe('POST /documents', () => {
    it('should create a new document', async () => {
      const newDoc = {
        title: 'New Document',
        content: '# New Content',
        type: 'ESSAY'
      };

      const createdDoc = {
        id: 'new-doc-id',
        ...newDoc,
        userId: 'test-user-id',
        isPublic: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      (mockPrisma.document.create as jest.Mock).mockResolvedValue(createdDoc);
      (mockPrisma.documentVersion.create as jest.Mock).mockResolvedValue({
        id: 'version-id',
        documentId: 'new-doc-id',
        content: newDoc.content,
        version: 1
      });

      const response = await request(app)
        .post('/documents')
        .set('Authorization', 'Bearer mock-token')
        .send(newDoc);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe(newDoc.title);
      expect(response.body.id).toBe('new-doc-id');
    });

    it('should validate input data', async () => {
      const response = await request(app)
        .post('/documents')
        .set('Authorization', 'Bearer mock-token')
        .send({
          title: '', // Empty title
          content: '# Content',
          type: 'INVALID_TYPE'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('PUT /documents/:id', () => {
    it('should update a document and create version', async () => {
      const existingDoc = {
        id: 'doc1',
        title: 'Old Title',
        content: '# Old Content',
        userId: 'test-user-id'
      };

      const updateData = {
        title: 'Updated Title',
        content: '# Updated Content'
      };

      (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue(existingDoc);
      (mockPrisma.document.update as jest.Mock).mockResolvedValue({
        ...existingDoc,
        ...updateData
      });
      (mockPrisma.documentVersion.findFirst as jest.Mock).mockResolvedValue({
        version: 1
      });
      (mockPrisma.documentVersion.create as jest.Mock).mockResolvedValue({
        id: 'version-2',
        version: 2
      });

      const response = await request(app)
        .put('/documents/doc1')
        .set('Authorization', 'Bearer mock-token')
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Updated Title');
    });

    it('should return 404 for non-existent document', async () => {
      (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .put('/documents/non-existent')
        .set('Authorization', 'Bearer mock-token')
        .send({ title: 'New Title' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Document not found');
    });
  });

  describe('DELETE /documents/:id', () => {
    it('should delete a document', async () => {
      (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue({
        id: 'doc1',
        userId: 'test-user-id'
      });
      (mockPrisma.document.delete as jest.Mock).mockResolvedValue({});

      const response = await request(app)
        .delete('/documents/doc1')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Document deleted successfully');
    });

    it('should return 404 for non-existent document', async () => {
      (mockPrisma.document.findFirst as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .delete('/documents/non-existent')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Document not found');
    });
  });
});