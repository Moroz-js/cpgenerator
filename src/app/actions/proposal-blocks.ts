'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { BlockType } from '@/lib/builder/block-types';
import { validateBlockProps, styleOverridesSchema } from '@/lib/validations/blocks';
import { getDefaultProps } from '@/lib/builder/blocks-registry';
import {
  type Result,
  authenticationError,
  authorizationError,
  validationError,
  notFoundError,
  unknownError,
} from '@/types/errors';
import type { ProposalBlock, BlockProps, StyleOverrides } from '@/lib/builder/block-types';

/**
 * Get all blocks for a proposal
 */
export async function getProposalBlocks(proposalId: string): Promise<Result<ProposalBlock[]>> {
  console.log('=== getProposalBlocks START ===');
  console.log('Input:', { proposalId });

  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { userId: user?.id, authError });

    if (authError || !user) {
      console.log('Authentication failed');
      console.log('=== getProposalBlocks END ===');
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Get proposal to check workspace membership
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('workspace_id')
      .eq('id', proposalId)
      .single();

    console.log('Proposal check:', { proposal, proposalError });

    if (proposalError || !proposal) {
      console.error('Proposal not found:', proposalError);
      console.log('=== getProposalBlocks END ===');
      return {
        success: false,
        error: notFoundError('КП не найдено', 'proposal'),
      };
    }

    // Check if user is member of workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', proposal.workspace_id)
      .eq('user_id', user.id)
      .single();

    console.log('Membership check:', { membership, membershipError });

    if (membershipError || !membership) {
      console.log('Authorization failed - user is not a member of workspace');
      console.log('=== getProposalBlocks END ===');
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Get all blocks for the proposal
    const { data: blocks, error: blocksError } = await supabase
      .from('proposal_blocks')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('order_index', { ascending: true });

    console.log('Database response:', { blocksCount: blocks?.length, blocksError });

    if (blocksError) {
      console.error('Error fetching blocks:', blocksError);
      console.error('Error details:', JSON.stringify(blocksError, null, 2));
      console.log('=== getProposalBlocks END ===');
      return {
        success: false,
        error: unknownError('Не удалось получить блоки КП'),
      };
    }

    console.log('Blocks retrieved successfully');
    console.log('=== getProposalBlocks END ===');

    return {
      success: true,
      data: blocks.map(block => ({
        id: block.id,
        proposalId: block.proposal_id,
        type: block.type as BlockType,
        orderIndex: block.order_index,
        props: block.props as BlockProps,
        styleOverrides: block.style_overrides as StyleOverrides | undefined,
        createdAt: block.created_at,
        updatedAt: block.updated_at,
      })),
    };
  } catch (error) {
    console.error('Get proposal blocks error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.log('=== getProposalBlocks END ===');
    return {
      success: false,
      error: unknownError('Произошла ошибка при получении блоков КП'),
    };
  }
}

export async function reorderProposalBlocks(
  proposalId: string,
  orderedIds: string[]
): Promise<Result<void>> {
  console.log('=== reorderProposalBlocks START ===');
  console.log('Input:', { proposalId, orderedIds });

  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { userId: user?.id, authError });

    if (authError || !user) {
      console.log('Authentication failed');
      console.log('=== reorderProposalBlocks END ===');
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('workspace_id')
      .eq('id', proposalId)
      .single();

    console.log('Proposal check:', { proposal, proposalError });

    if (proposalError || !proposal) {
      console.error('Proposal not found:', proposalError);
      console.log('=== reorderProposalBlocks END ===');
      return {
        success: false,
        error: notFoundError('КП не найдено', 'proposal'),
      };
    }

    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', proposal.workspace_id)
      .eq('user_id', user.id)
      .single();

    console.log('Membership check:', { membership, membershipError });

    if (membershipError || !membership) {
      console.log('Authorization failed - user is not a member of workspace');
      console.log('=== reorderProposalBlocks END ===');
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    const { data: blocks, error: blocksError } = await supabase
      .from('proposal_blocks')
      .select('id, order_index')
      .eq('proposal_id', proposalId)
      .order('order_index', { ascending: true });

    console.log('Existing blocks:', { count: blocks?.length, blocksError });

    if (blocksError) {
      console.error('Error fetching blocks:', blocksError);
      console.error('Error details:', JSON.stringify(blocksError, null, 2));
      console.log('=== reorderProposalBlocks END ===');
      return {
        success: false,
        error: unknownError('Не удалось получить блоки для перестановки'),
      };
    }

    const existingIds = new Set((blocks || []).map(b => b.id));
    const orderedSet = new Set(orderedIds);
    const valid = existingIds.size === orderedSet.size && [...existingIds].every(id => orderedSet.has(id));
    console.log('Validation of IDs:', { valid, existingCount: existingIds.size, orderedCount: orderedSet.size });

    if (!valid) {
      console.log('Validation failed - ID sets mismatch');
      console.log('=== reorderProposalBlocks END ===');
      return {
        success: false,
        error: validationError('Список блоков некорректен'),
      };
    }

    for (let i = 0; i < orderedIds.length; i++) {
      const id = orderedIds[i];
      const { error: updateError } = await supabase
        .from('proposal_blocks')
        .update({ order_index: i, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (updateError) {
        console.error('Error updating order_index:', updateError);
        console.error('Error details:', JSON.stringify(updateError, null, 2));
        console.log('=== reorderProposalBlocks END ===');
        return {
          success: false,
          error: unknownError('Не удалось изменить порядок блоков'),
        };
      }
    }

    revalidatePath(`/workspace/${proposal.workspace_id}/proposals/${proposalId}/builder`);
    console.log('Blocks reordered successfully');
    console.log('=== reorderProposalBlocks END ===');

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Reorder proposal blocks error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.log('=== reorderProposalBlocks END ===');
    return {
      success: false,
      error: unknownError('Произошла ошибка при изменении порядка блоков'),
    };
  }
}

export async function duplicateProposalBlock(blockId: string): Promise<Result<ProposalBlock>> {
  console.log('=== duplicateProposalBlock START ===');
  console.log('Input:', { blockId });

  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { userId: user?.id, authError });

    if (authError || !user) {
      console.log('Authentication failed');
      console.log('=== duplicateProposalBlock END ===');
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    const { data: existingBlock, error: blockError } = await supabase
      .from('proposal_blocks')
      .select('*, proposals!inner(workspace_id)')
      .eq('id', blockId)
      .single();

    console.log('Existing block check:', { existingBlock: existingBlock?.id, blockError });

    if (blockError || !existingBlock) {
      console.error('Block not found:', blockError);
      console.log('=== duplicateProposalBlock END ===');
      return {
        success: false,
        error: notFoundError('Блок не найден', 'block'),
      };
    }

    const workspaceIdForBlock = (existingBlock as any).proposals?.workspace_id as string;
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceIdForBlock)
      .eq('user_id', user.id)
      .single();

    console.log('Membership check:', { membership, membershipError });

    if (membershipError || !membership) {
      console.log('Authorization failed - user is not a member of workspace');
      console.log('=== duplicateProposalBlock END ===');
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    const desiredOrderIndex = (existingBlock.order_index ?? 0) + 1;

    const { data: newBlock, error: createError } = await supabase
      .from('proposal_blocks')
      .insert({
        proposal_id: existingBlock.proposal_id,
        type: existingBlock.type,
        order_index: desiredOrderIndex,
        props: existingBlock.props,
        style_overrides: existingBlock.style_overrides || {},
      })
      .select()
      .single();

    console.log('Duplicate insert response:', { newBlock: newBlock?.id, createError });

    if (createError) {
      console.error('Error duplicating block:', createError);
      console.error('Error details:', JSON.stringify(createError, null, 2));
      console.log('=== duplicateProposalBlock END ===');
      return {
        success: false,
        error: unknownError('Не удалось дублировать блок'),
      };
    }

    const { data: allBlocks, error: fetchError } = await supabase
      .from('proposal_blocks')
      .select('id, order_index')
      .eq('proposal_id', existingBlock.proposal_id)
      .order('order_index', { ascending: true });

    console.log('Fetch blocks for renumber:', { count: allBlocks?.length, fetchError });

    if (fetchError) {
      console.error('Error fetching blocks for renumber:', fetchError);
      console.error('Error details:', JSON.stringify(fetchError, null, 2));
    } else {
      for (let i = 0; i < (allBlocks || []).length; i++) {
        const id = allBlocks![i].id;
        const { error: updateError } = await supabase
          .from('proposal_blocks')
          .update({ order_index: i, updated_at: new Date().toISOString() })
          .eq('id', id);

        if (updateError) {
          console.error('Error renumbering block:', updateError);
          console.error('Error details:', JSON.stringify(updateError, null, 2));
          break;
        }
      }
    }

    revalidatePath(`/workspace/${workspaceIdForBlock}/proposals/${existingBlock.proposal_id}/builder`);

    console.log('Block duplicated successfully');
    console.log('=== duplicateProposalBlock END ===');

    return {
      success: true,
      data: {
        id: newBlock.id,
        proposalId: newBlock.proposal_id,
        type: newBlock.type as BlockType,
        orderIndex: newBlock.order_index,
        props: newBlock.props as BlockProps,
        styleOverrides: newBlock.style_overrides as StyleOverrides | undefined,
        createdAt: newBlock.created_at,
        updatedAt: newBlock.updated_at,
      },
    };
  } catch (error) {
    console.error('Duplicate proposal block error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.log('=== duplicateProposalBlock END ===');
    return {
      success: false,
      error: unknownError('Произошла ошибка при дублировании блока'),
    };
  }
}
/**
 * Create a new proposal block
 */
export async function createProposalBlock(
  proposalId: string,
  type: BlockType,
  props: BlockProps,
  orderIndex?: number
): Promise<Result<ProposalBlock>> {
  console.log('=== createProposalBlock START ===');
  console.log('Input:', { proposalId, type, props: JSON.stringify(props, null, 2), orderIndex });

  try {
    // Validate block props based on type
    const propsValidation = validateBlockProps(type, props);
    console.log('Props validation result:', {
      success: propsValidation.success,
      errors: propsValidation.success ? null : propsValidation.error.flatten(),
    });

    if (!propsValidation.success) {
      console.log('Props validation failed');
      console.log('=== createProposalBlock END ===');
      return {
        success: false,
        error: validationError(
          'Неверные данные блока',
          propsValidation.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { userId: user?.id, authError });

    if (authError || !user) {
      console.log('Authentication failed');
      console.log('=== createProposalBlock END ===');
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Get proposal to check workspace membership
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('workspace_id')
      .eq('id', proposalId)
      .single();

    console.log('Proposal check:', { proposal, proposalError });

    if (proposalError || !proposal) {
      console.error('Proposal not found:', proposalError);
      console.log('=== createProposalBlock END ===');
      return {
        success: false,
        error: notFoundError('КП не найдено', 'proposal'),
      };
    }

    // Check if user is member of workspace
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', proposal.workspace_id)
      .eq('user_id', user.id)
      .single();

    console.log('Membership check:', { membership, membershipError });

    if (membershipError || !membership) {
      console.log('Authorization failed - user is not a member of workspace');
      console.log('=== createProposalBlock END ===');
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Determine order_index if not provided
    let finalOrderIndex = orderIndex;
    if (finalOrderIndex === undefined) {
      // Get the max order_index and add 1
      const { data: maxBlock, error: maxError } = await supabase
        .from('proposal_blocks')
        .select('order_index')
        .eq('proposal_id', proposalId)
        .order('order_index', { ascending: false })
        .limit(1)
        .single();

      console.log('Max order_index check:', { maxBlock, maxError });

      if (maxError && maxError.code !== 'PGRST116') {
        // PGRST116 means no rows found, which is fine
        console.error('Error getting max order_index:', maxError);
      }

      finalOrderIndex = maxBlock ? maxBlock.order_index + 1 : 0;
    }

    console.log('Final order_index:', finalOrderIndex);

    // Create the block
    const { data: block, error: createError } = await supabase
      .from('proposal_blocks')
      .insert({
        proposal_id: proposalId,
        type,
        order_index: finalOrderIndex,
        props: propsValidation.data,
        style_overrides: {},
      })
      .select()
      .single();

    console.log('Database response:', { block, createError });

    if (createError) {
      console.error('Error creating block:', createError);
      console.error('Error details:', JSON.stringify(createError, null, 2));
      console.log('=== createProposalBlock END ===');
      return {
        success: false,
        error: unknownError('Не удалось создать блок'),
      };
    }

    // Revalidate the builder page
    revalidatePath(`/workspace/${proposal.workspace_id}/proposals/${proposalId}/builder`);

    console.log('Block created successfully');
    console.log('=== createProposalBlock END ===');

    return {
      success: true,
      data: {
        id: block.id,
        proposalId: block.proposal_id,
        type: block.type as BlockType,
        orderIndex: block.order_index,
        props: block.props as BlockProps,
        styleOverrides: block.style_overrides as StyleOverrides | undefined,
        createdAt: block.created_at,
        updatedAt: block.updated_at,
      },
    };
  } catch (error) {
    console.error('Create proposal block error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.log('=== createProposalBlock END ===');
    return {
      success: false,
      error: unknownError('Произошла ошибка при создании блока'),
    };
  }
}

/**
 * Update an existing proposal block
 */
export async function updateProposalBlock(
  blockId: string,
  props?: BlockProps,
  styleOverrides?: StyleOverrides
): Promise<Result<ProposalBlock>> {
  console.log('=== updateProposalBlock START ===');
  console.log('Input:', {
    blockId,
    props: props ? JSON.stringify(props, null, 2) : undefined,
    styleOverrides: styleOverrides ? JSON.stringify(styleOverrides, null, 2) : undefined,
  });

  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { userId: user?.id, authError });

    if (authError || !user) {
      console.log('Authentication failed');
      console.log('=== updateProposalBlock END ===');
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Get the block to check access and get its type
    const { data: existingBlock, error: blockError } = await supabase
      .from('proposal_blocks')
      .select('*, proposals!inner(workspace_id)')
      .eq('id', blockId)
      .single();

    console.log('Existing block check:', { existingBlock: existingBlock?.id, blockError });

    if (blockError || !existingBlock) {
      console.error('Block not found:', blockError);
      console.log('=== updateProposalBlock END ===');
      return {
        success: false,
        error: notFoundError('Блок не найден', 'block'),
      };
    }

    // Check if user is member of workspace
    const workspaceIdForBlock = (existingBlock as any).proposals?.workspace_id as string;
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceIdForBlock)
      .eq('user_id', user.id)
      .single();

    console.log('Membership check:', { membership, membershipError });

    if (membershipError || !membership) {
      console.log('Authorization failed - user is not a member of workspace');
      console.log('=== updateProposalBlock END ===');
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Build update object
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    // Validate and update props if provided
    if (props !== undefined) {
      const propsValidation = validateBlockProps(existingBlock.type as BlockType, props);
      console.log('Props validation result:', {
        success: propsValidation.success,
        errors: propsValidation.success ? null : propsValidation.error.flatten(),
      });

      if (!propsValidation.success) {
        console.log('Props validation failed');
        console.log('=== updateProposalBlock END ===');
        return {
          success: false,
          error: validationError(
            'Неверные данные блока',
            propsValidation.error.flatten().fieldErrors as Record<string, string[]>
          ),
        };
      }

      updateData.props = propsValidation.data;
    }

    // Validate and update style overrides if provided
    if (styleOverrides !== undefined) {
      const styleValidation = styleOverridesSchema.safeParse(styleOverrides);
      console.log('Style overrides validation result:', {
        success: styleValidation.success,
        errors: styleValidation.success ? null : styleValidation.error.flatten(),
      });

      if (!styleValidation.success) {
        console.log('Style overrides validation failed');
        console.log('=== updateProposalBlock END ===');
        return {
          success: false,
          error: validationError(
            'Неверные стили блока',
            styleValidation.error.flatten().fieldErrors as Record<string, string[]>
          ),
        };
      }

      updateData.style_overrides = styleValidation.data;
    }

    console.log('Updating block with data:', JSON.stringify(updateData, null, 2));

    // Update the block
    const { data: updatedBlock, error: updateError } = await supabase
      .from('proposal_blocks')
      .update(updateData)
      .eq('id', blockId)
      .select()
      .single();

    console.log('Database response:', { updatedBlock: updatedBlock?.id, updateError });

    if (updateError) {
      console.error('Error updating block:', updateError);
      console.error('Error details:', JSON.stringify(updateError, null, 2));
      console.log('=== updateProposalBlock END ===');
      return {
        success: false,
        error: unknownError('Не удалось обновить блок'),
      };
    }

    // Revalidate the builder page
    revalidatePath(`/workspace/${workspaceIdForBlock}/proposals/${existingBlock.proposal_id}/builder`);

    console.log('Block updated successfully');
    console.log('=== updateProposalBlock END ===');

    return {
      success: true,
      data: {
        id: updatedBlock.id,
        proposalId: updatedBlock.proposal_id,
        type: updatedBlock.type as BlockType,
        orderIndex: updatedBlock.order_index,
        props: updatedBlock.props as BlockProps,
        styleOverrides: updatedBlock.style_overrides as StyleOverrides | undefined,
        createdAt: updatedBlock.created_at,
        updatedAt: updatedBlock.updated_at,
      },
    };
  } catch (error) {
    console.error('Update proposal block error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.log('=== updateProposalBlock END ===');
    return {
      success: false,
      error: unknownError('Произошла ошибка при обновлении блока'),
    };
  }
}

/**
 * Delete a proposal block
 */
export async function deleteProposalBlock(blockId: string): Promise<Result<void>> {
  console.log('=== deleteProposalBlock START ===');
  console.log('Input:', { blockId });

  try {
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log('Auth check:', { userId: user?.id, authError });

    if (authError || !user) {
      console.log('Authentication failed');
      console.log('=== deleteProposalBlock END ===');
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    // Get the block to check access
    const { data: existingBlock, error: blockError } = await supabase
      .from('proposal_blocks')
      .select('proposal_id, proposals!inner(workspace_id)')
      .eq('id', blockId)
      .single();

    console.log('Existing block check:', { existingBlock: existingBlock?.proposal_id, blockError });

    if (blockError || !existingBlock) {
      console.error('Block not found:', blockError);
      console.log('=== deleteProposalBlock END ===');
      return {
        success: false,
        error: notFoundError('Блок не найден', 'block'),
      };
    }

    // Check if user is member of workspace
    const workspaceIdForBlock = (existingBlock as any).proposals?.workspace_id as string;
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceIdForBlock)
      .eq('user_id', user.id)
      .single();

    console.log('Membership check:', { membership, membershipError });

    if (membershipError || !membership) {
      console.log('Authorization failed - user is not a member of workspace');
      console.log('=== deleteProposalBlock END ===');
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Delete the block
    const { error: deleteError } = await supabase
      .from('proposal_blocks')
      .delete()
      .eq('id', blockId);

    console.log('Database response:', { deleteError });

    if (deleteError) {
      console.error('Error deleting block:', deleteError);
      console.error('Error details:', JSON.stringify(deleteError, null, 2));
      console.log('=== deleteProposalBlock END ===');
      return {
        success: false,
        error: unknownError('Не удалось удалить блок'),
      };
    }

    // Revalidate the builder page
    revalidatePath(`/workspace/${workspaceIdForBlock}/proposals/${existingBlock.proposal_id}/builder`);

    console.log('Block deleted successfully');
    console.log('=== deleteProposalBlock END ===');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Delete proposal block error:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.log('=== deleteProposalBlock END ===');
    return {
      success: false,
      error: unknownError('Произошла ошибка при удалении блока'),
    };
  }
}
