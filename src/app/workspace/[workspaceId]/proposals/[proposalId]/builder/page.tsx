import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProposalBlocks } from '@/app/actions/proposal-blocks';
import { getWorkspaceBrandSettings } from '@/app/actions/brand';
import { ProposalBuilderPage } from '@/components/proposals/ProposalBuilderPage';

interface PageProps {
  params: Promise<{
    workspaceId: string;
    proposalId: string;
  }>;
}

export default async function BuilderPage({ params }: PageProps) {
  const { workspaceId, proposalId } = await params;

  console.log('=== Builder Page START ===');
  console.log('Params:', { workspaceId, proposalId });

  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.log('Authentication failed');
    notFound();
  }

  // Check workspace membership (middleware already checks this, but double-check)
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    console.log('User is not a member of workspace');
    notFound();
  }

  // Load proposal
  const { data: proposal, error: proposalError } = await supabase
    .from('proposals')
    .select('*')
    .eq('id', proposalId)
    .eq('workspace_id', workspaceId)
    .single();

  console.log('Proposal loaded:', { proposal, proposalError });

  if (proposalError || !proposal) {
    console.log('Proposal not found');
    notFound();
  }

  // Load blocks
  const blocksResult = await getProposalBlocks(proposalId);

  if (!blocksResult.success) {
    console.error('Failed to load blocks:', blocksResult.error);
    notFound();
  }

  // Load brand settings
  const brandResult = await getWorkspaceBrandSettings(workspaceId);

  if (!brandResult.success) {
    console.error('Failed to load brand settings:', brandResult.error);
    notFound();
  }

  // Load workspace cases for Cases block
  const { data: cases } = await supabase
    .from('cases')
    .select('id, title, description, technologies, images, links')
    .eq('workspace_id', workspaceId)
    .order('created_at', { ascending: false });

  // Load workspace FAQ items for FAQ block
  const { data: faqItems } = await supabase
    .from('faq_items')
    .select('id, question, answer, category')
    .eq('workspace_id', workspaceId)
    .order('order_index', { ascending: true });

  console.log('=== Builder Page END ===');

  return (
    <ProposalBuilderPage
      proposal={proposal}
      initialBlocks={blocksResult.data}
      brand={brandResult.data}
      availableCases={cases || []}
      availableFAQItems={faqItems || []}
    />
  );
}
