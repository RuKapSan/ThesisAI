import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const CreateDocumentSchema = z.object({
  title: z.string().min(1),
  content: z.string(),
  type: z.enum(['COURSEWORK', 'THESIS', 'ESSAY', 'REPORT', 'ARTICLE'])
});

const UpdateDocumentSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional()
});

router.use(authenticate);

router.get('/', async (req: AuthRequest, res): Promise<any> => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        type: true,
        updatedAt: true,
        createdAt: true
      }
    });

    return res.json(documents);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

router.get('/:id', async (req: AuthRequest, res): Promise<any> => {
  try {
    const document = await prisma.document.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 10
        }
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    return res.json(document);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch document' });
  }
});

router.post('/', async (req: AuthRequest, res): Promise<any> => {
  try {
    const data = CreateDocumentSchema.parse(req.body);

    const document = await prisma.document.create({
      data: {
        ...data,
        userId: req.userId!
      }
    });

    await prisma.documentVersion.create({
      data: {
        documentId: document.id,
        content: document.content,
        version: 1
      }
    });

    return res.json(document);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Failed to create document' });
  }
});

router.put('/:id', async (req: AuthRequest, res): Promise<any> => {
  try {
    const data = UpdateDocumentSchema.parse(req.body);

    const document = await prisma.document.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const updatedDocument = await prisma.document.update({
      where: { id: req.params.id },
      data
    });

    if (data.content) {
      const lastVersion = await prisma.documentVersion.findFirst({
        where: { documentId: document.id },
        orderBy: { version: 'desc' }
      });

      await prisma.documentVersion.create({
        data: {
          documentId: document.id,
          content: data.content,
          version: (lastVersion?.version || 0) + 1
        }
      });
    }

    return res.json(updatedDocument);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Failed to update document' });
  }
});

router.delete('/:id', async (req: AuthRequest, res): Promise<any> => {
  try {
    const document = await prisma.document.findFirst({
      where: {
        id: req.params.id,
        userId: req.userId
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await prisma.document.delete({
      where: { id: req.params.id }
    });

    return res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete document' });
  }
});

export default router;