import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout';
import { FileText, FolderOpen, ArrowRight, Users, UserPlus, HelpCircle } from 'lucide-react';
import Link from 'next/link';

interface WorkspacePageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspacePage({ params }: WorkspacePageProps) {
  const { workspaceId } = await params;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get workspace info
  const { data: workspace, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  if (error) {
    console.error('Workspace fetch error:', error);
  }

  if (!workspace) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Workspace Not Found</h1>
          {error && <p className="text-sm text-gray-600 mt-2">Error: {error.message}</p>}
        </div>
      </div>
    );
  }

  // Get members count
  const { count: membersCount } = await supabase
    .from('workspace_members')
    .select('*', { count: 'exact', head: true })
    .eq('workspace_id', workspaceId);

  // Check if current user is owner
  const { data: currentMember } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  const isOwner = currentMember?.role === 'owner';

  return (
    <>
      <Header 
        user={{
          email: user.email!,
          fullName: user.user_metadata?.full_name,
        }}
        showBackButton
        backHref="/"
        backLabel="All Workspaces"
        workspaceId={workspaceId}
      />
      <div className="container mx-auto py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{workspace.name}</h1>
          <p className="text-gray-600">Dashboard overview</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Proposals
              </CardTitle>
              <FileText className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-gray-500 mt-1">
                Create your first proposal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Case Studies
              </CardTitle>
              <FolderOpen className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">0</div>
              <p className="text-xs text-gray-500 mt-1">
                Build your portfolio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Team Members
              </CardTitle>
              <Users className="w-4 h-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{membersCount || 0}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Collaborate with your team
                </p>
                {isOwner && (
                  <Link href={`/workspace/${workspaceId}/settings`}>
                    <Button variant="ghost" size="sm" className="gap-1 h-7 text-xs">
                      <UserPlus className="w-3 h-3" />
                      Invite
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href={`/workspace/${workspaceId}/proposals`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle>Proposals</CardTitle>
                      <CardDescription>Create and manage proposals</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Build professional proposals with project timelines, team estimates, and case studies
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href={`/workspace/${workspaceId}/cases`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-100 rounded-lg">
                      <FolderOpen className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <CardTitle>Case Studies</CardTitle>
                      <CardDescription>Manage your portfolio</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Showcase your best work with detailed case studies including results and technologies
                </p>
              </CardContent>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href={`/workspace/${workspaceId}/faq`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-purple-100 rounded-lg">
                      <HelpCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle>FAQ Library</CardTitle>
                      <CardDescription>Manage Q&A content</CardDescription>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Create reusable FAQ items to include in your proposals
                </p>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </>
  );
}
