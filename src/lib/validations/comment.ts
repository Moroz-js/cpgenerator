import { z } from 'zod';

export const createCommentSchema = z.object({
  sectionId: z.string().uuid('Invalid section ID'),
  content: z.string().min(1, 'Comment content is required').max(5000, 'Comment is too long'),
  parentId: z.string().uuid('Invalid parent comment ID').optional(),
});

export const updateCommentSchema = z.object({
  id: z.string().uuid('Invalid comment ID'),
  content: z.string().min(1, 'Comment content is required').max(5000, 'Comment is too long'),
});

export const resolveCommentSchema = z.object({
  id: z.string().uuid('Invalid comment ID'),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>;
export type ResolveCommentInput = z.infer<typeof resolveCommentSchema>;
