import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

const CheckPlagiarismSchema = z.object({
  documentId: z.string().uuid()
});

router.use(authenticate);

function simulatePlagiarismCheck(content: string) {
  const hash = crypto.createHash('md5').update(content).digest('hex');
  const baseScore = parseInt(hash.substring(0, 2), 16) / 255;
  const originalityScore = 0.75 + (baseScore * 0.20);
  
  const segments = content.split('\n\n').map((segment, index) => {
    const segmentHash = crypto.createHash('md5').update(segment).digest('hex');
    const isOriginal = parseInt(segmentHash.substring(0, 1), 16) > 8;
    
    return {
      index,
      text: segment.substring(0, 100) + '...',
      isOriginal,
      similarity: isOriginal ? 0 : Math.random() * 0.3
    };
  });

  return {
    originalityScore: Math.min(originalityScore, 0.99),
    totalWords: content.split(' ').length,
    checkedSegments: segments.length,
    flaggedSegments: segments.filter(s => !s.isOriginal).length,
    segments: segments.slice(0, 10)
  };
}

router.post('/check', async (req: AuthRequest, res): Promise<any> => {
  try {
    const { documentId } = CheckPlagiarismSchema.parse(req.body);

    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        userId: req.userId
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const report = simulatePlagiarismCheck(document.content);

    const check = await prisma.plagiarismCheck.create({
      data: {
        documentId: document.id,
        originalityScore: report.originalityScore,
        report: report
      }
    });

    await prisma.document.update({
      where: { id: document.id },
      data: { lastChecked: new Date() }
    });

    return res.json({
      id: check.id,
      originalityScore: check.originalityScore,
      report: check.report,
      checkedAt: check.checkedAt
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Failed to check plagiarism' });
  }
});

router.get('/history/:documentId', async (req: AuthRequest, res): Promise<any> => {
  try {
    const document = await prisma.document.findFirst({
      where: {
        id: req.params.documentId,
        userId: req.userId
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const checks = await prisma.plagiarismCheck.findMany({
      where: { documentId: req.params.documentId },
      orderBy: { checkedAt: 'desc' },
      select: {
        id: true,
        originalityScore: true,
        checkedAt: true
      }
    });

    return res.json(checks);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch check history' });
  }
});

router.get('/report/:checkId', async (req: AuthRequest, res): Promise<any> => {
  try {
    const check = await prisma.plagiarismCheck.findUnique({
      where: { id: req.params.checkId },
      include: {
        document: {
          select: {
            userId: true,
            title: true
          }
        }
      }
    });

    if (!check || check.document.userId !== req.userId) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.json({
      id: check.id,
      documentTitle: check.document.title,
      originalityScore: check.originalityScore,
      report: check.report,
      checkedAt: check.checkedAt
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch report' });
  }
});

export default router;