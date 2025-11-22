import { z } from 'zod';

export const sectionTypeSchema = z.enum(['introduction', 'approach', 'custom']);

export const createProposalSectionSchema = z.object({
  proposalId: z.string().uuid('Invalid proposal ID'),
  sectionType: sectionTypeSchema,
  content: z.any(), // Tiptap JSON content
  orderIndex: z.number().int().min(0, 'Order index must be non-negative'),
});

export const updateProposalSectionSchema = z.object({
  id: z.string().uuid('Invalid section ID'),
  sectionType: sectionTypeSchema.optional(),
  content: z.any().optional(),
  orderIndex: z.number().int().min(0, 'Order index must be non-negative').optional(),
});

export const createPreviewAttachmentSchema = z.object({
  sectionId: z.string().uuid('Invalid section ID'),
  textReference: z.string().min(1, 'Text reference is required'),
  attachmentType: z.enum(['image', 'link']),
  attachmentUrl: z.string().url('Invalid attachment URL'),
});

export type CreateProposalSectionInput = z.infer<typeof createProposalSectionSchema>;
export type UpdateProposalSectionInput = z.infer<typeof updateProposalSectionSchema>;
export type CreatePreviewAttachmentInput = z.infer<typeof createPreviewAttachmentSchema>;
export type SectionType = z.infer<typeof sectionTypeSchema>;
