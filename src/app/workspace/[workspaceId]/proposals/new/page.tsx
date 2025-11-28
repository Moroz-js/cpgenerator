import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NewProposalForm } from '@/components/proposals/NewProposalForm';
import { Header, Breadcrumbs } from '@/components/layout';

interface NewProposalPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function NewProposalPage({ params }: NewProposalPageProps) {
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

  return (
    <>
      <Header 
        user={{
          email: user.email!,
          fullName: user.user_metadata?.full_name,
        }}
        showBackButton
        backHref={`/workspace/${workspaceId}/proposals`}
        backLabel="Proposals"
        workspaceId={workspaceId}
      />
      <div className="container mx-auto px-4 py-8">
        <Breadcrumbs 
          items={[
            { label: 'Workspaces', href: '/' },
            { label: workspace?.name || 'Workspace', href: `/workspace/${workspaceId}` },
            { label: 'Proposals', href: `/workspace/${workspaceId}/proposals` },
            { label: 'New' }
          ]}
        />
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Создать КП</h1>
            <p className="text-gray-600">Заполните основную информацию для нового коммерческого предложения</p>
          </div>

          <NewProposalForm workspaceId={workspaceId} />
        </div>
      </div>
    </>
  );
}
