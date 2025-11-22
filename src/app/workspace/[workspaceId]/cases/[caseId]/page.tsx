import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { CaseView } from '@/components/cases';
import { Header, Breadcrumbs } from '@/components/layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EditCasePageProps {
  params: Promise<{
    workspaceId: string;
    caseId: string;
  }>;
}

export default async function EditCasePage({ params }: EditCasePageProps) {
  const { workspaceId, caseId } = await params;
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

  // Get case data
  const { data: caseData, error } = await supabase
    .from('cases')
    .select('*')
    .eq('id', caseId)
    .eq('workspace_id', workspaceId)
    .single();

  if (error || !caseData) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Case Not Found</h1>
          <p className="mt-2">The case you're looking for doesn't exist or you don't have access to it.</p>
        </div>
      </div>
    );
  }

  const caseItem = {
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
  };

  return (
    <>
      <Header 
        user={{
          email: user.email!,
          fullName: user.user_metadata?.full_name,
        }}
        showBackButton
        backHref={`/workspace/${workspaceId}/cases`}
        backLabel="Cases"
        workspaceId={workspaceId}
      />
      <div className="container mx-auto py-8 max-w-4xl">
        <Breadcrumbs 
          items={[
            { label: 'Workspaces', href: '/' },
            { label: workspace?.name || 'Workspace', href: `/workspace/${workspaceId}` },
            { label: 'Cases', href: `/workspace/${workspaceId}/cases` },
            { label: caseItem.title }
          ]}
        />
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{caseItem.title}</h1>
          <Link href={`/workspace/${workspaceId}/cases/${caseId}/edit`}>
            <Button>Edit Case</Button>
          </Link>
        </div>
        <CaseView case={caseItem} />
      </div>
    </>
  );
}
