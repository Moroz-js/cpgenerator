'use server';

import { createClient } from '@/lib/supabase/server';
import { getProposalBlocks } from './proposal-blocks';
import { getWorkspaceBrandSettings } from './brand';
import {
  type Result,
  authenticationError,
  authorizationError,
  notFoundError,
  unknownError,
} from '@/types/errors';

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function publishProposal(
  proposalId: string
): Promise<Result<{ slug: string; snapshotId: string }>> {
  console.log('=== publishProposal START ===');
  console.log('Input:', { proposalId });

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

    // Get proposal
    const { data: proposal, error: proposalError } = await supabase
      .from('proposals')
      .select('*, workspace_id')
      .eq('id', proposalId)
      .single();

    if (proposalError || !proposal) {
      return {
        success: false,
        error: notFoundError('КП не найдено', 'proposal'),
      };
    }

    // Check workspace membership
    const { data: membership, error: membershipError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('workspace_id', proposal.workspace_id)
      .eq('user_id', user.id)
      .single();

    if (membershipError || !membership) {
      return {
        success: false,
        error: authorizationError('У вас нет доступа к этому воркспейсу', 'workspace'),
      };
    }

    // Check if public link already exists
    const { data: existingLink } = await supabase
      .from('public_links')
      .select('*')
      .eq('proposal_id', proposalId)
      .single();

    let slug: string;
    let publicLinkId: string;

    if (existingLink) {
      slug = existingLink.slug;
      publicLinkId = existingLink.id;
      console.log('Using existing public link:', { slug, publicLinkId });
    } else {
      // Generate unique slug
      let baseSlug = generateSlug(proposal.title);
      slug = baseSlug;
      let counter = 1;

      // Check uniqueness
      while (true) {
        const { data: existing } = await supabase
          .from('public_links')
          .select('id')
          .eq('slug', slug)
          .single();

        if (!existing) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      // Create public link
      const { data: newLink, error: linkError } = await supabase
        .from('public_links')
        .insert({
          proposal_id: proposalId,
          slug,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();

      if (linkError || !newLink) {
        console.error('Failed to create public link:', linkError);
        return {
          success: false,
          error: unknownError('Не удалось создать публичную ссылку'),
        };
      }

      publicLinkId = newLink.id;
      console.log('Created new public link:', { slug, publicLinkId });
    }

    // Load brand settings
    const brandResult = await getWorkspaceBrandSettings(proposal.workspace_id);
    if (!brandResult.success) {
      console.error('Failed to load brand settings:', brandResult.error);
      return {
        success: false,
        error: unknownError('Не удалось загрузить настройки брендинга'),
      };
    }

    // Load blocks
    const blocksResult = await getProposalBlocks(proposalId);
    if (!blocksResult.success) {
      console.error('Failed to load blocks:', blocksResult.error);
      return {
        success: false,
        error: unknownError('Не удалось загрузить блоки КП'),
      };
    }

    // Resolve data for blocks (cases, FAQ items)
    const resolvedBlocks = await Promise.all(
      blocksResult.data.map(async (block) => {
        const resolvedBlock = { ...block };
        const props = block.props as any;

        // Resolve cases
        if (block.type.startsWith('cases_') && props.caseIds) {
          const { data: cases } = await supabase
            .from('cases')
            .select('*')
            .in('id', props.caseIds);

          resolvedBlock.props = {
            ...props,
            cases: cases || [],
          } as any;
        }

        // Resolve FAQ items
        if (block.type.startsWith('faq_') && props.faqItemIds) {
          const { data: faqItems } = await supabase
            .from('faq_items')
            .select('*')
            .in('id', props.faqItemIds);

          resolvedBlock.props = {
            ...props,
            faqItems: faqItems || [],
          } as any;
        }

        return resolvedBlock;
      })
    );

    // Create snapshot
    const { data: snapshot, error: snapshotError } = await supabase
      .from('proposal_snapshots')
      .insert({
        public_link_id: publicLinkId,
        proposal_id: proposalId,
        brand: brandResult.data,
        blocks: resolvedBlocks,
        meta: {
          version: '1.0',
          publishedAt: new Date().toISOString(),
          publishedBy: user.id,
        },
      })
      .select()
      .single();

    if (snapshotError || !snapshot) {
      console.error('Failed to create snapshot:', snapshotError);
      return {
        success: false,
        error: unknownError('Не удалось создать снимок КП'),
      };
    }

    console.log('Snapshot created:', { snapshotId: snapshot.id });
    console.log('=== publishProposal END ===');

    return {
      success: true,
      data: {
        slug,
        snapshotId: snapshot.id,
      },
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
