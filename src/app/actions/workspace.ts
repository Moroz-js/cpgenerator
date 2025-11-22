'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  createWorkspaceSchema,
  inviteMemberSchema,
  removeMemberSchema,
  acceptInvitationSchema,
  switchWorkspaceSchema,
  type CreateWorkspaceInput,
  type InviteMemberInput,
  type RemoveMemberInput,
  type AcceptInvitationInput,
  type SwitchWorkspaceInput,
} from '@/lib/validations/workspace';
import {
  type Result,
  authenticationError,
  authorizationError,
  validationError,
  notFoundError,
  unknownError,
} from '@/types/errors';
import type { Workspace, Invitation } from '@/types/database';
import { randomBytes } from 'crypto';

/**
 * Create a new workspace
 */
export async function createWorkspace(name: string): Promise<Result<Workspace>> {
  try {
    // Validate input
    const validated = createWorkspaceSchema.safeParse({ name });
    if (!validated.success) {
      return {
        success: false,
        error: validationError(
          'Invalid workspace data',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: authenticationError('You must be logged in'),
      };
    }

    // Create workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({
        name: validated.data.name,
        owner_id: user.id,
      })
      .select()
      .single();

    if (workspaceError) {
      console.error('Workspace creation error:', workspaceError);
      console.error('Error details:', JSON.stringify(workspaceError, null, 2));
      return {
        success: false,
        error: unknownError(`Failed to create workspace: ${workspaceError.message || 'Unknown error'}`),
      };
    }

    // Create owner membership explicitly (in case trigger doesn't work)
    const { error: membershipError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: workspace.id,
        user_id: user.id,
        role: 'owner',
      });

    if (membershipError) {
      console.error('Membership creation error:', membershipError);
      // Don't fail the whole operation if membership creation fails
      // The trigger might have already created it
    }

    revalidatePath('/');

    return {
      success: true,
      data: {
        id: workspace.id,
        name: workspace.name,
        ownerId: workspace.owner_id,
        createdAt: workspace.created_at,
        updatedAt: workspace.updated_at,
      },
    };
  } catch (error) {
    console.error('Create workspace error:', error);
    return {
      success: false,
      error: unknownError('An error occurred while creating workspace'),
    };
  }
}

/**
 * Invite a member to workspace
 */
export async function inviteMember(
  workspaceId: string,
  email: string
): Promise<Result<Invitation>> {
  try {
    // Validate input
    const validated = inviteMemberSchema.safeParse({ workspaceId, email });
    if (!validated.success) {
      return {
        success: false,
        error: validationError(
          'Invalid invitation data',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Check if user is owner of workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .select('owner_id')
      .eq('id', workspaceId)
      .single();

    if (workspaceError || !workspace) {
      return {
        success: false,
        error: notFoundError('Воркспейс не найден', 'workspace'),
      };
    }

    if (workspace.owner_id !== user.id) {
      return {
        success: false,
        error: authorizationError('Только владелец воркспейса может приглашать участников', 'workspace'),
      };
    }

    // Generate unique token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

    // Create invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .insert({
        workspace_id: workspaceId,
        email: validated.data.email,
        token,
        invited_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (invitationError) {
      console.error('Invitation creation error:', invitationError);
      console.error('Error details:', JSON.stringify(invitationError, null, 2));
      return {
        success: false,
        error: unknownError(`Не удалось создать приглашение: ${invitationError.message || 'Unknown error'}`),
      };
    }

    // Check if user with this email already exists
    const { data: invitedUser, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', validated.data.email)
      .single();

    console.log('Looking for user with email:', validated.data.email);
    console.log('Found user:', invitedUser);
    console.log('Profile error:', profileError);

    // If user exists, add them to workspace immediately
    if (invitedUser) {
      console.log('Adding user to workspace:', invitedUser.id);
      const { error: membershipError } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: invitedUser.id,
          role: 'member',
        });

      if (membershipError) {
        console.error('Membership creation error:', membershipError);
        console.error('Membership error details:', JSON.stringify(membershipError, null, 2));
        // Don't fail - invitation is still created
      } else {
        console.log('Membership created successfully');
        // Mark invitation as accepted
        await supabase
          .from('invitations')
          .update({ status: 'accepted' })
          .eq('id', invitation.id);
      }
    } else {
      console.log('User not found in profiles table');
    }

    // TODO: Send email with invitation link for users who don't have an account yet

    revalidatePath(`/workspace/${workspaceId}`);
    revalidatePath(`/workspace/${workspaceId}/settings`);

    return {
      success: true,
      data: {
        id: invitation.id,
        workspaceId: invitation.workspace_id,
        email: invitation.email,
        token: invitation.token,
        invitedBy: invitation.invited_by,
        status: invitedUser ? 'accepted' : ('pending' as 'pending' | 'accepted' | 'expired'),
        createdAt: invitation.created_at,
        expiresAt: invitation.expires_at,
      },
    };
  } catch (error) {
    console.error('Invite member error:', error);
    return {
      success: false,
      error: unknownError('Произошла ошибка при отправке приглашения'),
    };
  }
}

/**
 * Remove a member from workspace
 */
export async function removeMember(
  workspaceId: string,
  userId: string
): Promise<Result<void>> {
  try {
    // Validate input
    const validated = removeMemberSchema.safeParse({ workspaceId, userId });
    if (!validated.success) {
      return {
        success: false,
        error: validationError(
          'Неверные данные',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Check if current user is owner
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership || membership.role !== 'owner') {
      return {
        success: false,
        error: authorizationError('Только владелец может удалять участников', 'workspace'),
      };
    }

    // Check if target user is owner
    const { data: targetMembership, error: targetError } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId)
      .single();

    if (targetError || !targetMembership) {
      return {
        success: false,
        error: notFoundError('Участник не найден', 'member'),
      };
    }

    if (targetMembership.role === 'owner') {
      return {
        success: false,
        error: authorizationError('Нельзя удалить владельца воркспейса', 'workspace'),
      };
    }

    // Remove member
    const { error: deleteError } = await supabase
      .from('workspace_members')
      .delete()
      .eq('workspace_id', workspaceId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Remove member error:', deleteError);
      return {
        success: false,
        error: unknownError('Не удалось удалить участника'),
      };
    }

    revalidatePath(`/workspace/${workspaceId}`);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Remove member error:', error);
    return {
      success: false,
      error: unknownError('Произошла ошибка при удалении участника'),
    };
  }
}

/**
 * Accept an invitation
 */
export async function acceptInvitation(token: string): Promise<Result<void>> {
  try {
    // Validate input
    const validated = acceptInvitationSchema.safeParse({ token });
    if (!validated.success) {
      return {
        success: false,
        error: validationError(
          'Неверный токен приглашения',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Find invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('*')
      .eq('token', validated.data.token)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      return {
        success: false,
        error: notFoundError('Приглашение не найдено или уже использовано', 'invitation'),
      };
    }

    // Check if invitation expired
    if (new Date(invitation.expires_at) < new Date()) {
      await supabase
        .from('invitations')
        .update({ status: 'expired' })
        .eq('id', invitation.id);

      return {
        success: false,
        error: validationError('Приглашение истекло'),
      };
    }

    // Check if user email matches invitation
    if (user.email !== invitation.email) {
      return {
        success: false,
        error: authorizationError('Это приглашение предназначено для другого email', 'invitation'),
      };
    }

    // Check if user is already a member
    const { data: existingMember } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', invitation.workspace_id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      // Update invitation status
      await supabase
        .from('invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      return {
        success: false,
        error: validationError('Вы уже являетесь участником этого воркспейса'),
      };
    }

    // Add user as member
    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({
        workspace_id: invitation.workspace_id,
        user_id: user.id,
        role: 'member',
      });

    if (memberError) {
      console.error('Add member error:', memberError);
      return {
        success: false,
        error: unknownError('Не удалось добавить участника'),
      };
    }

    // Update invitation status
    const { error: updateError } = await supabase
      .from('invitations')
      .update({ status: 'accepted' })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('Update invitation error:', updateError);
    }

    revalidatePath('/');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Accept invitation error:', error);
    return {
      success: false,
      error: unknownError('Произошла ошибка при принятии приглашения'),
    };
  }
}

/**
 * Switch to a different workspace
 */
export async function switchWorkspace(workspaceId: string): Promise<Result<void>> {
  try {
    // Validate input
    const validated = switchWorkspaceSchema.safeParse({ workspaceId });
    if (!validated.success) {
      return {
        success: false,
        error: validationError(
          'Неверный ID воркспейса',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Check if user is member of workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // In a real app, you might store the current workspace in a cookie or session
    // For now, we'll just revalidate the path
    revalidatePath('/');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Switch workspace error:', error);
    return {
      success: false,
      error: unknownError('Произошла ошибка при переключении воркспейса'),
    };
  }
}
