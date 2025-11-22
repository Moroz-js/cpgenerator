'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  createProposalSchema,
  updateProposalSchema,
  type CreateProposalInput,
  type UpdateProposalInput,
} from '@/lib/validations/proposal';
import {
  type Result,
  authenticationError,
  authorizationError,
  validationError,
  notFoundError,
  unknownError,
} from '@/types/errors';
import type { Proposal } from '@/types/database';

/**
 * Create a new proposal
 */
export async function createProposal(input: CreateProposalInput): Promise<Result<Proposal>> {
  console.log('=== createProposal START ===');
  console.log('Input:', JSON.stringify(input, null, 2));

  try {
    // Validate input
    const validated = createProposalSchema.safeParse(input);
    if (!validated.success) {
      console.error('Validation error:', validated.error);
      return {
        success: false,
        error: validationError(
          'Неверные данные для создания КП',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { user: user?.id, error: authError });
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Check if user is member of workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', validated.data.workspaceId)
      .eq('user_id', user.id)
      .single();

    console.log('Membership check:', { membership, error: membershipError });

    if (membershipError || !membership) {
      console.error('Authorization error:', membershipError);
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Create proposal
    const { data: proposalData, error: proposalError } = await supabase
      .from('proposals')
      .insert({
        workspace_id: validated.data.workspaceId,
        title: validated.data.title,
        client_name: validated.data.clientName,
        status: validated.data.status,
        timeline: validated.data.timeline,
        team_estimate: validated.data.teamEstimate,
        selected_cases: validated.data.selectedCases,
        contacts: validated.data.contacts,
        processes: validated.data.processes,
        tech_stack: validated.data.techStack,
        faq: validated.data.faq,
        payment_schedule: validated.data.paymentSchedule,
        video_url: validated.data.loomVideos?.[0]?.url, // For now, store first video URL
        created_by: user.id,
      })
      .select()
      .single();

    console.log('Database response:', { data: proposalData, error: proposalError });

    if (proposalError) {
      console.error('Proposal creation error:', JSON.stringify(proposalError, null, 2));
      return {
        success: false,
        error: unknownError('Не удалось создать КП'),
      };
    }

    revalidatePath(`/workspace/${validated.data.workspaceId}/proposals`);

    console.log('=== createProposal END (SUCCESS) ===');

    return {
      success: true,
      data: {
        id: proposalData.id,
        workspaceId: proposalData.workspace_id,
        title: proposalData.title,
        clientName: proposalData.client_name,
        status: proposalData.status,
        timeline: proposalData.timeline,
        teamEstimate: proposalData.team_estimate,
        selectedCases: proposalData.selected_cases,
        contacts: proposalData.contacts,
        processes: proposalData.processes,
        techStack: proposalData.tech_stack,
        faq: proposalData.faq,
        paymentSchedule: proposalData.payment_schedule,
        videoUrl: proposalData.video_url,
        createdBy: proposalData.created_by,
        createdAt: proposalData.created_at,
        updatedAt: proposalData.updated_at,
        lastAutosave: proposalData.last_autosave,
      },
    };
  } catch (error) {
    console.error('Create proposal error:', JSON.stringify(error, null, 2));
    console.log('=== createProposal END (ERROR) ===');
    return {
      success: false,
      error: unknownError('Произошла ошибка при создании КП'),
    };
  }
}

/**
 * Update an existing proposal
 */
export async function updateProposal(input: UpdateProposalInput): Promise<Result<Proposal>> {
  console.log('=== updateProposal START ===');
  console.log('Input:', JSON.stringify(input, null, 2));

  try {
    // Validate input
    const validated = updateProposalSchema.safeParse(input);
    if (!validated.success) {
      console.error('Validation error:', validated.error);
      return {
        success: false,
        error: validationError(
          'Неверные данные для обновления КП',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { user: user?.id, error: authError });
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Get proposal to check workspace membership
    const { data: existingProposal, error: proposalError } = await supabase
      .from('proposals')
      .select('workspace_id')
      .eq('id', validated.data.id)
      .single();

    console.log('Existing proposal check:', { proposal: existingProposal, error: proposalError });

    if (proposalError || !existingProposal) {
      console.error('Proposal not found:', proposalError);
      return {
        success: false,
        error: notFoundError('КП не найдено', 'proposal'),
      };
    }

    // Check if user is member of workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', existingProposal.workspace_id)
      .eq('user_id', user.id)
      .single();

    console.log('Membership check:', { membership, error: membershipError });

    if (membershipError || !membership) {
      console.error('Authorization error:', membershipError);
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Build update object (only include fields that are present)
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (validated.data.title !== undefined) updateData.title = validated.data.title;
    if (validated.data.clientName !== undefined) updateData.client_name = validated.data.clientName;
    if (validated.data.status !== undefined) updateData.status = validated.data.status;
    if (validated.data.timeline !== undefined) updateData.timeline = validated.data.timeline;
    if (validated.data.teamEstimate !== undefined) updateData.team_estimate = validated.data.teamEstimate;
    if (validated.data.selectedCases !== undefined) updateData.selected_cases = validated.data.selectedCases;
    if (validated.data.contacts !== undefined) updateData.contacts = validated.data.contacts;
    if (validated.data.processes !== undefined) updateData.processes = validated.data.processes;
    if (validated.data.techStack !== undefined) updateData.tech_stack = validated.data.techStack;
    if (validated.data.faq !== undefined) updateData.faq = validated.data.faq;
    if (validated.data.paymentSchedule !== undefined) updateData.payment_schedule = validated.data.paymentSchedule;
    if (validated.data.loomVideos !== undefined && validated.data.loomVideos.length > 0) {
      updateData.video_url = validated.data.loomVideos[0].url;
    }

    // Update proposal
    const { data: updatedProposal, error: updateError } = await supabase
      .from('proposals')
      .update(updateData)
      .eq('id', validated.data.id)
      .select()
      .single();

    console.log('Database response:', { data: updatedProposal, error: updateError });

    if (updateError) {
      console.error('Proposal update error:', JSON.stringify(updateError, null, 2));
      return {
        success: false,
        error: unknownError('Не удалось обновить КП'),
      };
    }

    revalidatePath(`/workspace/${existingProposal.workspace_id}/proposals`);

    console.log('=== updateProposal END (SUCCESS) ===');

    return {
      success: true,
      data: {
        id: updatedProposal.id,
        workspaceId: updatedProposal.workspace_id,
        title: updatedProposal.title,
        clientName: updatedProposal.client_name,
        status: updatedProposal.status,
        timeline: updatedProposal.timeline,
        teamEstimate: updatedProposal.team_estimate,
        selectedCases: updatedProposal.selected_cases,
        contacts: updatedProposal.contacts,
        processes: updatedProposal.processes,
        techStack: updatedProposal.tech_stack,
        faq: updatedProposal.faq,
        paymentSchedule: updatedProposal.payment_schedule,
        videoUrl: updatedProposal.video_url,
        createdBy: updatedProposal.created_by,
        createdAt: updatedProposal.created_at,
        updatedAt: updatedProposal.updated_at,
        lastAutosave: updatedProposal.last_autosave,
      },
    };
  } catch (error) {
    console.error('Update proposal error:', JSON.stringify(error, null, 2));
    console.log('=== updateProposal END (ERROR) ===');
    return {
      success: false,
      error: unknownError('Произошла ошибка при обновлении КП'),
    };
  }
}

/**
 * Delete a proposal
 */
export async function deleteProposal(id: string): Promise<Result<void>> {
  console.log('=== deleteProposal START ===');
  console.log('Input:', { id });

  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { user: user?.id, error: authError });
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Get proposal to check workspace membership
    const { data: existingProposal, error: proposalError } = await supabase
      .from('proposals')
      .select('workspace_id')
      .eq('id', id)
      .single();

    console.log('Existing proposal check:', { proposal: existingProposal, error: proposalError });

    if (proposalError || !existingProposal) {
      console.error('Proposal not found:', proposalError);
      return {
        success: false,
        error: notFoundError('КП не найдено', 'proposal'),
      };
    }

    // Check if user is member of workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', existingProposal.workspace_id)
      .eq('user_id', user.id)
      .single();

    console.log('Membership check:', { membership, error: membershipError });

    if (membershipError || !membership) {
      console.error('Authorization error:', membershipError);
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Delete proposal (cascade will handle related data)
    const { error: deleteError } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id);

    console.log('Database response:', { error: deleteError });

    if (deleteError) {
      console.error('Proposal deletion error:', JSON.stringify(deleteError, null, 2));
      return {
        success: false,
        error: unknownError('Не удалось удалить КП'),
      };
    }

    revalidatePath(`/workspace/${existingProposal.workspace_id}/proposals`);

    console.log('=== deleteProposal END (SUCCESS) ===');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Delete proposal error:', JSON.stringify(error, null, 2));
    console.log('=== deleteProposal END (ERROR) ===');
    return {
      success: false,
      error: unknownError('Произошла ошибка при удалении КП'),
    };
  }
}

/**
 * Duplicate a proposal
 */
export async function duplicateProposal(id: string): Promise<Result<Proposal>> {
  console.log('=== duplicateProposal START ===');
  console.log('Input:', { id });

  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { user: user?.id, error: authError });
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Get original proposal
    const { data: originalProposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single();

    console.log('Original proposal check:', { proposal: originalProposal?.id, error: proposalError });

    if (proposalError || !originalProposal) {
      console.error('Proposal not found:', proposalError);
      return {
        success: false,
        error: notFoundError('КП не найдено', 'proposal'),
      };
    }

    // Check if user is member of workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', originalProposal.workspace_id)
      .eq('user_id', user.id)
      .single();

    console.log('Membership check:', { membership, error: membershipError });

    if (membershipError || !membership) {
      console.error('Authorization error:', membershipError);
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Create duplicate proposal
    const { data: duplicatedProposal, error: duplicateError } = await supabase
      .from('proposals')
      .insert({
        workspace_id: originalProposal.workspace_id,
        title: `${originalProposal.title} (копия)`,
        client_name: originalProposal.client_name,
        status: 'draft', // Always start as draft
        timeline: originalProposal.timeline,
        team_estimate: originalProposal.team_estimate,
        selected_cases: originalProposal.selected_cases,
        contacts: originalProposal.contacts,
        processes: originalProposal.processes,
        tech_stack: originalProposal.tech_stack,
        faq: originalProposal.faq,
        payment_schedule: originalProposal.payment_schedule,
        video_url: originalProposal.video_url,
        created_by: user.id,
      })
      .select()
      .single();

    console.log('Database response:', { data: duplicatedProposal?.id, error: duplicateError });

    if (duplicateError) {
      console.error('Proposal duplication error:', JSON.stringify(duplicateError, null, 2));
      return {
        success: false,
        error: unknownError('Не удалось дублировать КП'),
      };
    }

    revalidatePath(`/workspace/${originalProposal.workspace_id}/proposals`);

    console.log('=== duplicateProposal END (SUCCESS) ===');

    return {
      success: true,
      data: {
        id: duplicatedProposal.id,
        workspaceId: duplicatedProposal.workspace_id,
        title: duplicatedProposal.title,
        clientName: duplicatedProposal.client_name,
        status: duplicatedProposal.status,
        timeline: duplicatedProposal.timeline,
        teamEstimate: duplicatedProposal.team_estimate,
        selectedCases: duplicatedProposal.selected_cases,
        contacts: duplicatedProposal.contacts,
        processes: duplicatedProposal.processes,
        techStack: duplicatedProposal.tech_stack,
        faq: duplicatedProposal.faq,
        paymentSchedule: duplicatedProposal.payment_schedule,
        videoUrl: duplicatedProposal.video_url,
        createdBy: duplicatedProposal.created_by,
        createdAt: duplicatedProposal.created_at,
        updatedAt: duplicatedProposal.updated_at,
        lastAutosave: duplicatedProposal.last_autosave,
      },
    };
  } catch (error) {
    console.error('Duplicate proposal error:', JSON.stringify(error, null, 2));
    console.log('=== duplicateProposal END (ERROR) ===');
    return {
      success: false,
      error: unknownError('Произошла ошибка при дублировании КП'),
    };
  }
}

/**
 * Get proposals for a workspace with optional filtering
 */
export async function getProposals(
  workspaceId: string,
  filters?: {
    status?: 'draft' | 'sent' | 'accepted' | 'rejected';
    search?: string;
  }
): Promise<Result<Proposal[]>> {
  console.log('=== getProposals START ===');
  console.log('Input:', { workspaceId, filters });

  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { user: user?.id, error: authError });
    
    if (authError || !user) {
      console.error('Authentication error:', authError);
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

    console.log('Membership check:', { membership, error: membershipError });

    if (membershipError || !membership) {
      console.error('Authorization error:', membershipError);
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Build query
    let query = supabase
      .from('proposals')
      .select('*')
      .eq('workspace_id', workspaceId);

    // Apply status filter
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    // Apply search filter (search in title)
    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }

    // Order by creation date (newest first)
    query = query.order('created_at', { ascending: false });

    const { data: proposals, error: proposalsError } = await query;

    console.log('Database response:', { count: proposals?.length, error: proposalsError });

    if (proposalsError) {
      console.error('Get proposals error:', JSON.stringify(proposalsError, null, 2));
      return {
        success: false,
        error: unknownError('Не удалось получить КП'),
      };
    }

    console.log('=== getProposals END (SUCCESS) ===');

    return {
      success: true,
      data: proposals.map(p => ({
        id: p.id,
        workspaceId: p.workspace_id,
        title: p.title,
        clientName: p.client_name,
        status: p.status,
        timeline: p.timeline,
        teamEstimate: p.team_estimate,
        selectedCases: p.selected_cases,
        contacts: p.contacts,
        processes: p.processes,
        techStack: p.tech_stack,
        faq: p.faq,
        paymentSchedule: p.payment_schedule,
        videoUrl: p.video_url,
        createdBy: p.created_by,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
        lastAutosave: p.last_autosave,
      })),
    };
  } catch (error) {
    console.error('Get proposals error:', JSON.stringify(error, null, 2));
    console.log('=== getProposals END (ERROR) ===');
    return {
      success: false,
      error: unknownError('Произошла ошибка при получении КП'),
    };
  }
}
