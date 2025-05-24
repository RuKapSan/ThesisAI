import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticate, AuthRequest } from '../../src/middleware/auth';
import { errorHandler } from '../../src/middleware/errorHandler';
import { PrismaClient } from '@prisma/client';

const mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;

describe('Middleware', () => {
  describe('authenticate', () => {
    let mockReq: Partial<AuthRequest>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {
        headers: {}
      };
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
      process.env.JWT_SECRET = 'test-secret';
    });

    it('should authenticate valid token', async () => {
      const token = jwt.sign({ userId: 'user123' }, 'test-secret');
      mockReq.headers!.authorization = `Bearer ${token}`;

      const mockUser = {
        id: 'user123',
        email: 'test@example.com',
        name: 'Test User'
      };

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(mockUser);

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockReq.userId).toBe('user123');
      expect(mockReq.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should reject missing token', async () => {
      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'No token provided' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      mockReq.headers!.authorization = 'Bearer invalid-token';

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should reject token with non-existent user', async () => {
      const token = jwt.sign({ userId: 'user123' }, 'test-secret');
      mockReq.headers!.authorization = `Bearer ${token}`;

      (mockPrisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await authenticate(mockReq as AuthRequest, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('errorHandler', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
      mockReq = {};
      mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      mockNext = jest.fn();
    });

    it('should handle validation errors', () => {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Validation failed'
      });
    });

    it('should handle JWT errors', () => {
      const error = new Error('Invalid token');
      error.name = 'JsonWebTokenError';

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(401);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Invalid token'
      });
    });

    it('should handle generic errors in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Something went wrong');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Something went wrong'
      });
    });

    it('should hide error details in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Sensitive error details');

      errorHandler(error, mockReq as Request, mockRes as Response, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Something went wrong'
      });
    });
  });
});