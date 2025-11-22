import { z } from 'zod';

export const createWorkspaceSchema = z.object({
  name: z.string()
    .min(2, 'Workspace name must be at least 2 characters')
    .max(100, 'Workspace name is too long')
    .refine((val) => val.trim().length >= 2, 'Workspace name cannot be only whitespace'),
});

export const inviteMemberSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  email: z.string().email('Invalid email address'),
});

export const removeMemberSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
  userId: z.string().uuid('Invalid user ID'),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const switchWorkspaceSchema = z.object({
  workspaceId: z.string().uuid('Invalid workspace ID'),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type RemoveMemberInput = z.infer<typeof removeMemberSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
export type SwitchWorkspaceInput = z.infer<typeof switchWorkspaceSchema>;
