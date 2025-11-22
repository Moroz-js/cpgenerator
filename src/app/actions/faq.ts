'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  createFAQSchema,
  updateFAQSchema,
  type CreateFAQInput,
  type UpdateFAQInput,
} from '@/lib/validations/faq';
import {
  type Result,
  validationError,
  authenticationError,
  notFoundError,
  unknownError,
} from '@/types/errors';
import type { FAQ } from '@/types/database';

/**
 * Create a new FAQ item
 */
export async function createFAQ(input: CreateFAQInput): Promise<Result<FAQ>> {
  try {
    const validated = createFAQSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validationError(
          'Invalid FAQ data',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: authenticationError('You must be logged in'),
      };
    }

    const { data: faq, error: faqError } = await supabase
      .from('faq_items')
      .insert({
        workspace_id: validated.data.workspaceId,
        question: validated.data.question,
        answer: validated.data.answer,
        category: validated.data.category,
        order_index: validated.data.orderIndex,
        created_by: user.id,
      })
      .select()
      .single();

    if (faqError) {
      console.error('FAQ creation error:', faqError);
      return {
        success: false,
        error: unknownError('Failed to create FAQ item'),
      };
    }

    revalidatePath(`/workspace/${validated.data.workspaceId}`);

    return {
      success: true,
      data: {
        id: faq.id,
        workspaceId: faq.workspace_id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        orderIndex: faq.order_index,
        createdBy: faq.created_by,
        createdAt: faq.created_at,
        updatedAt: faq.updated_at,
      },
    };
  } catch (error) {
    console.error('Create FAQ error:', error);
    return {
      success: false,
      error: unknownError('An error occurred while creating FAQ item'),
    };
  }
}

/**
 * Update an existing FAQ item
 */
export async function updateFAQ(input: UpdateFAQInput): Promise<Result<FAQ>> {
  try {
    const validated = updateFAQSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validationError(
          'Invalid FAQ data',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: authenticationError('You must be logged in'),
      };
    }

    const updateData: any = {};
    if (validated.data.question !== undefined) updateData.question = validated.data.question;
    if (validated.data.answer !== undefined) updateData.answer = validated.data.answer;
    if (validated.data.category !== undefined) updateData.category = validated.data.category;
    if (validated.data.orderIndex !== undefined) updateData.order_index = validated.data.orderIndex;

    const { data: faq, error: faqError } = await supabase
      .from('faq_items')
      .update(updateData)
      .eq('id', validated.data.id)
      .select()
      .single();

    if (faqError) {
      console.error('FAQ update error:', faqError);
      return {
        success: false,
        error: unknownError('Failed to update FAQ item'),
      };
    }

    if (!faq) {
      return {
        success: false,
        error: notFoundError('FAQ item not found', 'faq'),
      };
    }

    revalidatePath(`/workspace/${faq.workspace_id}`);

    return {
      success: true,
      data: {
        id: faq.id,
        workspaceId: faq.workspace_id,
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        orderIndex: faq.order_index,
        createdBy: faq.created_by,
        createdAt: faq.created_at,
        updatedAt: faq.updated_at,
      },
    };
  } catch (error) {
    console.error('Update FAQ error:', error);
    return {
      success: false,
      error: unknownError('An error occurred while updating FAQ item'),
    };
  }
}

/**
 * Delete an FAQ item
 */
export async function deleteFAQ(id: string): Promise<Result<void>> {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: authenticationError('You must be logged in'),
      };
    }

    // Get workspace_id before deleting for revalidation
    const { data: faq } = await supabase
      .from('faq_items')
      .select('workspace_id')
      .eq('id', id)
      .single();

    const { error: deleteError } = await supabase
      .from('faq_items')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('FAQ deletion error:', deleteError);
      return {
        success: false,
        error: unknownError('Failed to delete FAQ item'),
      };
    }

    if (faq) {
      revalidatePath(`/workspace/${faq.workspace_id}`);
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Delete FAQ error:', error);
    return {
      success: false,
      error: unknownError('An error occurred while deleting FAQ item'),
    };
  }
}
