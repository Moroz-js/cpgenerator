import { z } from 'zod';

export const generatePublicLinkSchema = z.object({
  proposalId: z.string().uuid('Invalid proposal ID'),
  slug: z.string()
    .min(3, 'Slug must be at least 3 characters')
    .max(100, 'Slug is too long')
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
});

export const deactivatePublicLinkSchema = z.object({
  linkId: z.string().uuid('Invalid link ID'),
});

export type GeneratePublicLinkInput = z.infer<typeof generatePublicLinkSchema>;
export type DeactivatePublicLinkInput = z.infer<typeof deactivatePublicLinkSchema>;
