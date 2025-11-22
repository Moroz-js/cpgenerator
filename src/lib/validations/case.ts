import { z } from 'zod';

export const createCaseSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(5000, 'Description is too long').optional(),
  technologies: z.array(z.string()).default([]),
  results: z.string().max(5000, 'Results text is too long').optional(),
  images: z.array(z.string().url('Invalid image URL')).default([]),
});

export const updateCaseSchema = createCaseSchema.partial().extend({
  id: z.string().uuid('Invalid case ID'),
});

export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export type UpdateCaseInput = z.infer<typeof updateCaseSchema>;
