'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  createCaseSchema,
  updateCaseSchema,
  type CreateCaseInput,
  type UpdateCaseInput,
} from '@/lib/validations/case';
import {
  type Result,
  authenticationError,
  authorizationError,
  validationError,
  notFoundError,
  unknownError,
} from '@/types/errors';
import type { Case } from '@/types/database';

/**
 * Create a new case
 */
export async function createCase(input: CreateCaseInput): Promise<Result<Case>> {
  try {
    // Validate input
    const validated = createCaseSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validationError(
          'Неверные данные для создания кейса',
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
      .eq('workspace_id', validated.data.workspaceId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Create case
    const { data: caseData, error: caseError } = await supabase
      .from('cases')
      .insert({
        workspace_id: validated.data.workspaceId,
        title: validated.data.title,
        description: validated.data.description,
        technologies: validated.data.technologies,
        results: validated.data.results,
        images: validated.data.images,
        links: validated.data.links,
        created_by: user.id,
      })
      .select()
      .single();

    if (caseError) {
      console.error('Case creation error:', caseError);
      return {
        success: false,
        error: unknownError('Не удалось создать кейс'),
      };
    }

    revalidatePath(`/workspace/${validated.data.workspaceId}/cases`);

    return {
      success: true,
      data: {
        id: caseData.id,
        workspaceId: caseData.workspace_id,
        title: caseData.title,
        description: caseData.description,
        technologies: caseData.technologies,
        results: caseData.results,
        images: caseData.images,
        links: caseData.links,
        createdBy: caseData.created_by,
        createdAt: caseData.created_at,
        updatedAt: caseData.updated_at,
      },
    };
  } catch (error) {
    console.error('Create case error:', error);
    return {
      success: false,
      error: unknownError('Произошла ошибка при создании кейса'),
    };
  }
}

/**
 * Update an existing case
 */
export async function updateCase(
  id: string,
  input: Omit<CreateCaseInput, 'workspaceId'>
): Promise<Result<Case>> {
  try {
    // Validate input
    const validated = updateCaseSchema.safeParse({ ...input, id });
    if (!validated.success) {
      return {
        success: false,
        error: validationError(
          'Неверные данные для обновления кейса',
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

    // Get case to check workspace membership
    const { data: existingCase, error: caseError } = await supabase
      .from('cases')
      .select('workspace_id')
      .eq('id', id)
      .single();

    if (caseError || !existingCase) {
      return {
        success: false,
        error: notFoundError('Кейс не найден', 'case'),
      };
    }

    // Check if user is member of workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', existingCase.workspace_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Update case
    const { data: updatedCase, error: updateError } = await supabase
      .from('cases')
      .update({
        title: validated.data.title,
        description: validated.data.description,
        technologies: validated.data.technologies,
        results: validated.data.results,
        images: validated.data.images,
        links: validated.data.links,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Case update error:', updateError);
      return {
        success: false,
        error: unknownError('Не удалось обновить кейс'),
      };
    }

    revalidatePath(`/workspace/${existingCase.workspace_id}/cases`);

    return {
      success: true,
      data: {
        id: updatedCase.id,
        workspaceId: updatedCase.workspace_id,
        title: updatedCase.title,
        description: updatedCase.description,
        technologies: updatedCase.technologies,
        results: updatedCase.results,
        images: updatedCase.images,
        links: updatedCase.links,
        createdBy: updatedCase.created_by,
        createdAt: updatedCase.created_at,
        updatedAt: updatedCase.updated_at,
      },
    };
  } catch (error) {
    console.error('Update case error:', error);
    return {
      success: false,
      error: unknownError('Произошла ошибка при обновлении кейса'),
    };
  }
}

/**
 * Delete a case
 */
export async function deleteCase(id: string): Promise<Result<void>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Get case to check workspace membership
    const { data: existingCase, error: caseError } = await supabase
      .from('cases')
      .select('workspace_id')
      .eq('id', id)
      .single();

    if (caseError || !existingCase) {
      return {
        success: false,
        error: notFoundError('Кейс не найден', 'case'),
      };
    }

    // Check if user is member of workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', existingCase.workspace_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Delete case
    const { error: deleteError } = await supabase
      .from('cases')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Case deletion error:', deleteError);
      return {
        success: false,
        error: unknownError('Не удалось удалить кейс'),
      };
    }

    revalidatePath(`/workspace/${existingCase.workspace_id}/cases`);

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Delete case error:', error);
    return {
      success: false,
      error: unknownError('Произошла ошибка при удалении кейса'),
    };
  }
}

/**
 * Get cases for a workspace
 */
export async function getCases(workspaceId: string): Promise<Result<Case[]>> {
  try {
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

    // Get cases
    const { data: cases, error: casesError } = await supabase
      .from('cases')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: false });

    if (casesError) {
      console.error('Get cases error:', casesError);
      return {
        success: false,
        error: unknownError('Не удалось получить кейсы'),
      };
    }

    return {
      success: true,
      data: cases.map(c => ({
        id: c.id,
        workspaceId: c.workspace_id,
        title: c.title,
        description: c.description,
        technologies: c.technologies,
        results: c.results,
        images: c.images,
        links: c.links,
        createdBy: c.created_by,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      })),
    };
  } catch (error) {
    console.error('Get cases error:', error);
    return {
      success: false,
      error: unknownError('Произошла ошибка при получении кейсов'),
    };
  }
}

/**
 * Upload case image (placeholder - needs Supabase Storage implementation)
 */
export async function uploadCaseImage(
  caseId: string,
  file: File
): Promise<Result<string>> {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // TODO: Implement actual file upload to Supabase Storage
    // For now, return a placeholder URL
    const mockUrl = `https://placeholder.com/${file.name}`;

    return {
      success: true,
      data: mockUrl,
    };
  } catch (error) {
    console.error('Upload image error:', error);
    return {
      success: false,
      error: unknownError('Произошла ошибка при загрузке изображения'),
    };
  }
}
