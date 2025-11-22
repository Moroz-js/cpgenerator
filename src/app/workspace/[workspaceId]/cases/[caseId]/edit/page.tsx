'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { CaseEditor } from '@/components/cases';
import { getCases } from '@/app/actions/cases';
import { Header, Breadcrumbs } from '@/components/layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';
import type { Case } from '@/types/database';

interface EditCasePageProps {
  params: Promise<{
    workspaceId: string;
    caseId: string;
  }>;
}

export default function EditCasePage({ params }: EditCasePageProps) {
  const { workspaceId, caseId } = use(params);
  const router = useRouter();
  const [caseItem, setCaseItem] = useState<Case | null>(null);
  const [user, setUser] = useState<any>(null);
  const [workspaceName, setWorkspaceName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        const { data: workspace } = await supabase
          .from('workspaces')
          .select('name')
          .eq('id', workspaceId)
          .single();
        
        setWorkspaceName(workspace?.name || 'Workspace');

        const result = await getCases(workspaceId);
        if (!result.success) {
          setError(result.error.message);
          return;
        }

        const foundCase = result.data.find(c => c.id === caseId);
        if (!foundCase) {
          setError('Case not found');
          return;
        }

        setCaseItem(foundCase);
      } catch (err) {
        setError('Failed to load case');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [workspaceId, caseId]);

  const handleSuccess = (caseId: string) => {
    router.push(`/workspace/${workspaceId}/cases/${caseId}`);
  };

  const handleCancel = () => {
    router.push(`/workspace/${workspaceId}/cases/${caseId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div>Loading case...</div>
      </div>
    );
  }

  if (error || !caseItem) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-red-600">{error || 'Case not found'}</div>
      </div>
    );
  }

  return (
    <>
      <Header 
        user={user ? {
          email: user.email!,
          fullName: user.user_metadata?.full_name,
        } : undefined}
        showBackButton
        backHref={`/workspace/${workspaceId}/cases/${caseId}`}
        backLabel={caseItem.title}
        workspaceId={workspaceId}
      />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Breadcrumbs 
          items={[
            { label: 'Workspaces', href: '/' },
            { label: workspaceName, href: `/workspace/${workspaceId}` },
            { label: 'Cases', href: `/workspace/${workspaceId}/cases` },
            { label: caseItem.title, href: `/workspace/${workspaceId}/cases/${caseId}` },
            { label: 'Edit' }
          ]}
        />
        <Card>
          <CardHeader>
            <CardTitle>Edit Case</CardTitle>
          </CardHeader>
          <CardContent>
            <CaseEditor
              workspaceId={workspaceId}
              case={caseItem}
              onSuccess={handleSuccess}
              onCancel={handleCancel}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
