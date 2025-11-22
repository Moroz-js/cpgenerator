import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header, Breadcrumbs } from '@/components/layout';
import Link from 'next/link';

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
            <Button disabled>Create New Proposal</Button>
          </div>

        <Card>
          <CardHeader>
            <CardTitle>Coming Soon</CardTitle>
            <CardDescription>
              Proposal management features are currently under development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              This feature will allow you to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>Create and edit commercial proposals</li>
              <li>Add project timelines and team estimates</li>
              <li>Select cases from your portfolio</li>
              <li>Generate PDF versions</li>
              <li>Share proposals with clients via public links</li>
            </ul>
            <div className="mt-6">
              <Link href={`/workspace/${workspaceId}`}>
                <Button variant="outline">Back to Workspace</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}
