import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Header, Breadcrumbs } from '@/components/layout';
import { ProposalList } from '@/components/proposals';
import Link from 'next/link';
import { getProposals } from '@/app/actions/proposals';

interface ProposalsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function ProposalsPage({ params }: ProposalsPageProps) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Check workspace access
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('*')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    redirect('/');
  }

  // Get workspace name
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name')
    .eq('id', workspaceId)
    .single();

  // Get proposals
  const proposalsResult = await getProposals(workspaceId);
  const proposals = proposalsResult.success ? proposalsResult.data : [];

  return (
    <>
      <Header 
        user={{
          email: user.email!,
          fullName: user.user_metadata?.full_name,
        }}
        showBackButton
        backHref={`/workspace/${workspaceId}`}
        backLabel={workspace?.name || 'Workspace'}
        workspaceId={workspaceId}
      />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs 
          items={[
            { label: 'Workspaces', href: '/' },
            { label: workspace?.name || 'Workspace', href: `/workspace/${workspaceId}` },
            { label: 'Proposals' }
          ]}
        />
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Proposals</h1>
              <p className="text-gray-600">Manage your commercial proposals</p>
            </div>
            <Link href={`/workspace/${workspaceId}/proposals/new`}>
              <Button>Create Proposal</Button>
            </Link>
          </div>

          <ProposalList proposals={proposals} workspaceId={workspaceId} />
        </div>
      </div>
    </>
  );
}
