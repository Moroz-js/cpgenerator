'use server';

import { createClient } from '@/lib/supabase/server';
import type { Result } from '@/types/errors';
import { authenticationError, unknownError } from '@/types/errors';

export interface FAQItem {
  id: string;
  workspace_id: string;
  question: string;
  answer: string;
  category?: string;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export async function getWorkspaceFAQItems(
  workspaceId: string
): Promise<Result<FAQItem[]>> {
  console.log('=== getWorkspaceFAQItems START ===');
  console.log('Input:', { workspaceId });

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', workspaceId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      console.error('Membership error:', membershipError);
      return {
        success: false,
        error: authenticationError('Нет доступа к workspace'),
      };
    }

    const { data: faqItems, error: faqError } = await supabase
      .from('faq_items')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('order_index', { ascending: true });

    if (faqError) {
      console.error('FAQ query error:', faqError);
      return {
        success: false,
        error: unknownError(faqError.message),
      };
    }

    console.log('FAQ items loaded:', faqItems?.length || 0);
    console.log('=== getWorkspaceFAQItems END ===');

    return {
      success: true,
      data: faqItems || [],
    };
  } catch (error) {
    console.error('Unexpected error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: unknownError(
        error instanceof Error ? error.message : 'Unknown error'
      ),
    };
  }
}

export async function createFAQ(input: {
  workspaceId: string;
  question: string;
  answer: string;
  category?: string | null;
}): Promise<Result<FAQItem>> {
  console.log('=== createFAQ START ===');
  console.log('Input:', input);

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', input.workspaceId)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      console.error('Membership error:', membershipError);
      return {
        success: false,
        error: authenticationError('Нет доступа к workspace'),
      };
    }

    const { data: maxOrderData } = await supabase
      .from('faq_items')
      .select('order_index')
      .eq('workspace_id', input.workspaceId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (maxOrderData?.order_index ?? -1) + 1;

    const { data: faqItem, error: createError } = await supabase
      .from('faq_items')
      .insert({
        workspace_id: input.workspaceId,
        question: input.question,
        answer: input.answer,
        category: input.category || null,
        order_index: nextOrderIndex,
        created_by: user.id,
      })
      .select()
      .single();

    if (createError) {
      console.error('Create error:', createError);
      return {
        success: false,
        error: unknownError(createError.message),
      };
    }

    console.log('FAQ item created:', faqItem.id);
    console.log('=== createFAQ END ===');

    return {
      success: true,
      data: faqItem,
    };
  } catch (error) {
    console.error('Unexpected error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: unknownError(
        error instanceof Error ? error.message : 'Unknown error'
      ),
    };
  }
}

export async function updateFAQ(input: {
  id: string;
  question?: string;
  answer?: string;
  category?: string | null;
}): Promise<Result<FAQItem>> {
  console.log('=== updateFAQ START ===');
  console.log('Input:', input);

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    const { data: existingFAQ, error: fetchError } = await supabase
      .from('faq_items')
      .select('workspace_id')
      .eq('id', input.id)
      .single();

    if (fetchError || !existingFAQ) {
      console.error('Fetch error:', fetchError);
      return {
        success: false,
        error: unknownError('FAQ item not found'),
      };
    }

    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', existingFAQ.workspace_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      console.error('Membership error:', membershipError);
      return {
        success: false,
        error: authenticationError('Нет доступа к workspace'),
      };
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (input.question !== undefined) updateData.question = input.question;
    if (input.answer !== undefined) updateData.answer = input.answer;
    if (input.category !== undefined) updateData.category = input.category;

    const { data: faqItem, error: updateError } = await supabase
      .from('faq_items')
      .update(updateData)
      .eq('id', input.id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return {
        success: false,
        error: unknownError(updateError.message),
      };
    }

    console.log('FAQ item updated:', faqItem.id);
    console.log('=== updateFAQ END ===');

    return {
      success: true,
      data: faqItem,
    };
  } catch (error) {
    console.error('Unexpected error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: unknownError(
        error instanceof Error ? error.message : 'Unknown error'
      ),
    };
  }
}

export async function deleteFAQ(id: string): Promise<Result<void>> {
  console.log('=== deleteFAQ START ===');
  console.log('Input:', { id });

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return {
        success: false,
        error: authenticationError('Необходимо войти в систему'),
      };
    }

    const { data: existingFAQ, error: fetchError } = await supabase
      .from('faq_items')
      .select('workspace_id')
      .eq('id', id)
      .single();

    if (fetchError || !existingFAQ) {
      console.error('Fetch error:', fetchError);
      return {
        success: false,
        error: unknownError('FAQ item not found'),
      };
    }

    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', existingFAQ.workspace_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      console.error('Membership error:', membershipError);
      return {
        success: false,
        error: authenticationError('Нет доступа к workspace'),
      };
    }

    const { error: deleteError } = await supabase
      .from('faq_items')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return {
        success: false,
        error: unknownError(deleteError.message),
      };
    }

    console.log('FAQ item deleted');
    console.log('=== deleteFAQ END ===');

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Unexpected error:', JSON.stringify(error, null, 2));
    return {
      success: false,
      error: unknownError(
        error instanceof Error ? error.message : 'Unknown error'
      ),
    };
  }
}
