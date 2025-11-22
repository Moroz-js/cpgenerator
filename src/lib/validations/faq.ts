import { z } from 'zod';

export const createFAQSchema = z.object({
  workspaceId: z.string().uuid(),
  question: z.string().min(1, 'Question is required').max(500, 'Question is too long'),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().max(100).optional(),
  orderIndex: z.number().int().min(0).default(0),
});

export const updateFAQSchema = z.object({
  id: z.string().uuid(),
  question: z.string().min(1, 'Question is required').max(500, 'Question is too long').optional(),
  answer: z.string().min(1, 'Answer is required').optional(),
  category: z.string().max(100).optional().nullable(),
  orderIndex: z.number().int().min(0).optional(),
});

export type CreateFAQInput = z.infer<typeof createFAQSchema>;
export type UpdateFAQInput = z.infer<typeof updateFAQSchema>;
