'use client';

import { useRouter } from 'next/navigation';
import { use, useEffect, useState } from 'react';
import { CaseEditor } from '@/components/cases';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header, Breadcrumbs } from '@/components/layout';
import { createClient } from '@/lib/supabase/client';

interface NewCasePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default function NewCasePage({ params }: NewCasePageProps) {
  const { workspaceId } = use(params);
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data: workspace } = await supabase
        .from('workspaces')
        .select('name')
        .eq('id', workspaceId)
        .single();
      
      setWorkspaceName(workspace?.name || 'Workspace');
      setLoading(false);
    }
    loadData();
  }, [workspaceId]);

  const handleSuccess = (caseId: string) => {
    router.push(`/workspace/${workspaceId}/cases`);
  };

  const handleCancel = () => {
    router.push(`/workspace/${workspaceId}/cases`);
  };

  if (loading) {
    return <div className="container mx-auto py-8">Loading...</div>;
  }

  return (
    <>
      <Header 
        user={user ? {
          email: user.email!,
          fullName: user.user_metadata?.full_name,
        } : undefined}
        showBackButton
        backHref={`/workspace/${workspaceId}/cases`}
        backLabel="Cases"
        workspaceId={workspaceId}
      />
      <div className="container mx-auto py-8 max-w-3xl">
        <Breadcrumbs 
          items={[
            { label: 'Workspaces', href: '/' },
            { label: workspaceName, href: `/workspace/${workspaceId}` },
            { label: 'Cases', href: `/workspace/${workspaceId}/cases` },
            { label: 'New Case' }
          ]}
        />
        <Card>
          <CardHeader>
            <CardTitle>Create New Case</CardTitle>
          </CardHeader>
          <CardContent>
            <CaseEditor
              workspaceId={workspaceId}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
