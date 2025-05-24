import { Router } from 'express';
import OpenAI from 'openai';
import { z } from 'zod';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const CheckTextSchema = z.object({
  text: z.string().min(1),
  type: z.enum(['grammar', 'style', 'logic', 'facts'])
});

const GenerateSchema = z.object({
  prompt: z.string().min(1),
  context: z.string().optional(),
  type: z.enum(['continue', 'rephrase', 'outline', 'introduction', 'conclusion'])
});

const SourcesSchema = z.object({
  topic: z.string().min(1),
  count: z.number().min(1).max(10).default(5)
});

router.use(authenticate);

router.post('/check', async (req: AuthRequest, res) => {
  try {
    const { text, type } = CheckTextSchema.parse(req.body);

    const prompts = {
      grammar: 'Check the following text for grammar and spelling errors. Provide corrections and explanations.',
      style: 'Analyze the academic writing style of the following text. Suggest improvements for clarity and formality.',
      logic: 'Evaluate the logical flow and argumentation in the following text. Identify any logical fallacies or weak points.',
      facts: 'Check the factual accuracy of claims in the following text. Note any statements that need verification.'
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an academic writing assistant. Provide clear, constructive feedback.'
        },
        {
          role: 'user',
          content: `${prompts[type]}\n\nText: ${text}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    res.json({
      type,
      feedback: completion.choices[0].message.content
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to check text' });
  }
});

router.post('/generate', async (req: AuthRequest, res) => {
  try {
    const { prompt, context, type } = GenerateSchema.parse(req.body);

    const systemPrompts = {
      continue: 'Continue writing the academic text naturally, maintaining the same style and tone.',
      rephrase: 'Rephrase the text in a more academic and formal style while preserving the meaning.',
      outline: 'Create a detailed outline for an academic paper on the given topic.',
      introduction: 'Write an engaging academic introduction for the given topic.',
      conclusion: 'Write a comprehensive conclusion that summarizes the key points.'
    };

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an academic writing assistant. ${systemPrompts[type]}`
        },
        {
          role: 'user',
          content: context ? `Context: ${context}\n\n${prompt}` : prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    res.json({
      type,
      generated: completion.choices[0].message.content
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

router.post('/sources', async (req: AuthRequest, res) => {
  try {
    const { topic, count } = SourcesSchema.parse(req.body);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an academic research assistant. Suggest relevant academic sources with proper citations.'
        },
        {
          role: 'user',
          content: `Suggest ${count} relevant academic sources for the topic: "${topic}". Include authors, titles, years, and brief descriptions.`
        }
      ],
      temperature: 0.5,
      max_tokens: 1500
    });

    res.json({
      topic,
      sources: completion.choices[0].message.content
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to find sources' });
  }
});

router.post('/analyze-structure', async (req: AuthRequest, res) => {
  try {
    const { content } = z.object({ content: z.string() }).parse(req.body);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Analyze the structure of academic papers. Provide feedback on completeness, balance, and organization.'
        },
        {
          role: 'user',
          content: `Analyze the structure of this academic paper:\n\n${content}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    });

    res.json({
      analysis: completion.choices[0].message.content
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Failed to analyze structure' });
  }
});

export default router;