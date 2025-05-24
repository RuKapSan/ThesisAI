import request from 'supertest';
import express from 'express';
import aiRouter from '../../src/routes/ai';
import OpenAI from 'openai';

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
app.use('/ai', aiRouter);

const mockOpenAI = new OpenAI({ apiKey: 'test' }) as jest.Mocked<OpenAI>;

describe('AI Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-api-key';
  });

  describe('POST /ai/check', () => {
    it('should check grammar successfully', async () => {
      const response = await request(app)
        .post('/ai/check')
        .set('Authorization', 'Bearer mock-token')
        .send({
          text: 'This are a test sentence.',
          type: 'grammar'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('type', 'grammar');
      expect(response.body).toHaveProperty('feedback');
    });

    it('should check style successfully', async () => {
      const response = await request(app)
        .post('/ai/check')
        .set('Authorization', 'Bearer mock-token')
        .send({
          text: 'Gonna write bout stuff.',
          type: 'style'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('type', 'style');
      expect(response.body).toHaveProperty('feedback');
    });

    it('should validate input data', async () => {
      const response = await request(app)
        .post('/ai/check')
        .set('Authorization', 'Bearer mock-token')
        .send({
          text: '',
          type: 'invalid-type'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /ai/generate', () => {
    it('should continue text generation', async () => {
      const response = await request(app)
        .post('/ai/generate')
        .set('Authorization', 'Bearer mock-token')
        .send({
          prompt: 'Continue this text',
          context: 'The research shows that...',
          type: 'continue'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('type', 'continue');
      expect(response.body).toHaveProperty('generated');
    });

    it('should generate outline', async () => {
      const response = await request(app)
        .post('/ai/generate')
        .set('Authorization', 'Bearer mock-token')
        .send({
          prompt: 'Climate change impacts',
          type: 'outline'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('type', 'outline');
      expect(response.body).toHaveProperty('generated');
    });

    it('should rephrase text', async () => {
      const response = await request(app)
        .post('/ai/generate')
        .set('Authorization', 'Bearer mock-token')
        .send({
          prompt: 'The results show improvement',
          type: 'rephrase'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('type', 'rephrase');
      expect(response.body).toHaveProperty('generated');
    });
  });

  describe('POST /ai/sources', () => {
    it('should find relevant sources', async () => {
      const response = await request(app)
        .post('/ai/sources')
        .set('Authorization', 'Bearer mock-token')
        .send({
          topic: 'Machine learning in healthcare',
          count: 5
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('topic');
      expect(response.body).toHaveProperty('sources');
    });

    it('should validate count limits', async () => {
      const response = await request(app)
        .post('/ai/sources')
        .set('Authorization', 'Bearer mock-token')
        .send({
          topic: 'Test topic',
          count: 20 // Exceeds maximum
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });

  describe('POST /ai/analyze-structure', () => {
    it('should analyze document structure', async () => {
      const response = await request(app)
        .post('/ai/analyze-structure')
        .set('Authorization', 'Bearer mock-token')
        .send({
          content: `
            # Introduction
            This is the introduction.
            
            # Methodology
            This is the methodology section.
            
            # Results
            Here are the results.
            
            # Conclusion
            This is the conclusion.
          `
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('analysis');
    });

    it('should require content', async () => {
      const response = await request(app)
        .post('/ai/analyze-structure')
        .set('Authorization', 'Bearer mock-token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });
  });
});