import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout';
import Link from 'next/link';

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get user's workspaces
  const { data: memberships } = await supabase
    .from('workspace_members')
    .select(`
      *,
      workspace:workspaces(*)
    `)
    .eq('user_id', user.id);

  const workspaces = memberships?.map(m => ({
    id: m.workspace.id,
    name: m.workspace.name,
    ownerId: m.workspace.owner_id,
    role: m.role,
  })) || [];

  return (
    <>
      <Header 
        user={{
          email: user.email!,
          fullName: user.user_metadata?.full_name,
        }}
      />
      <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Workspaces</h1>
        <Link href="/workspace/new">
          <Button>Create Workspace</Button>
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Workspaces Yet</CardTitle>
            <CardDescription>Create your first workspace to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/workspace/new">
              <Button>Create Your First Workspace</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map((workspace) => (
            <Link key={workspace.id} href={`/workspace/${workspace.id}`}>
              <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                <CardHeader>
                  <CardTitle>{workspace.name}</CardTitle>
                  <CardDescription>
                    {workspace.role === 'owner' ? 'Owner' : 'Member'}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
      </div>
    </>
  );
}
