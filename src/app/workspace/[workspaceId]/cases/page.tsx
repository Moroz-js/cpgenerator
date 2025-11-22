import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getCases } from '@/app/actions/cases';
import { CaseList } from '@/components/cases';
import { Button } from '@/components/ui/button';
import { Header, Breadcrumbs } from '@/components/layout';
import Link from 'next/link';

interface CasesPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function CasesPage({ params }: CasesPageProps) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get workspace name
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('name')
    .eq('id', workspaceId)
    .single();

  const result = await getCases(workspaceId);

  if (!result.success) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2">{result.error.message}</p>
        </div>
      </div>
    );
  }

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
      <div className="container mx-auto py-8">
        <Breadcrumbs 
          items={[
            { label: 'Workspaces', href: '/' },
            { label: workspace?.name || 'Workspace', href: `/workspace/${workspaceId}` },
            { label: 'Cases' }
          ]}
        />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Cases</h1>
          <Link href={`/workspace/${workspaceId}/cases/new`}>
            <Button>Create New Case</Button>
          </Link>
        </div>

        <CaseList
          cases={result.data}
          workspaceId={workspaceId}
          onCaseClick={(caseId) => {
            // This will be handled client-side
          }}
        />
      </div>
    </>
  );
}
