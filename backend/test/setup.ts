import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    user: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    document: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    documentVersion: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    plagiarismCheck: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };

  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Mock OpenAI
jest.mock('openai', () => {
  return {
    default: jest.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue({
            choices: [{
              message: {
                content: 'Mock AI response'
              }
            }]
          })
        }
      }
    }))
  };
});

// Global test utilities
global.testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'STUDENT',
  password: 'hashedpassword',
  createdAt: new Date(),
  updatedAt: new Date(),
};

global.testDocument = {
  id: 'test-doc-id',
  title: 'Test Document',
  content: '# Test Content',
  type: 'COURSEWORK',
  userId: 'test-user-id',
  isPublic: false,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Clean up after tests
afterAll(async () => {
  jest.clearAllMocks();
});