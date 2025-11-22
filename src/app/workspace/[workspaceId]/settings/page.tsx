import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { WorkspaceSettings, InviteMemberForm, MemberList } from '@/components/workspace';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header, Breadcrumbs } from '@/components/layout';

interface SettingsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Get workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  if (!workspace) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Workspace Not Found</h1>
        </div>
      </div>
    );
  }

  // Check if current user is owner (directly from workspace table to avoid RLS issues)
  const isOwner = workspace.owner_id === user.id;

  // Get members
  const { data: membersRaw, error: membersError } = await supabase
    .from('workspace_members')
    .select('id, workspace_id, user_id, role, joined_at')
    .eq('workspace_id', workspaceId);

  if (membersError) {
    console.error('Members error:', membersError);
  }

  // Get profiles for all members
  const userIds = membersRaw?.map(m => m.user_id) || [];
  const { data: profilesData } = await supabase
    .from('profiles')
    .select('id, email, full_name, avatar_url')
    .in('id', userIds);

  // Combine members with their profiles
  const members = membersRaw?.map(member => ({
    ...member,
    profiles: profilesData?.find(p => p.id === member.user_id) || null
  }));

  const currentMember = members?.find(m => m.user_id === user.id);

  const workspaceData = {
    id: workspace.id,
    name: workspace.name,
    ownerId: workspace.owner_id,
    createdAt: workspace.created_at,
    updatedAt: workspace.updated_at,
  };

  const membersData = members?.map(m => ({
    id: m.id,
    workspaceId: m.workspace_id,
    userId: m.user_id,
    role: m.role as 'owner' | 'member',
    joinedAt: m.joined_at,
    user: m.profiles ? {
      id: m.profiles.id,
      email: m.profiles.email,
      fullName: m.profiles.full_name,
      avatarUrl: m.profiles.avatar_url,
    } : undefined,
  })) || [];

  return (
    <>
      <Header 
        user={{
          email: user.email!,
          fullName: user.user_metadata?.full_name,
        }}
        showBackButton
        backHref={`/workspace/${workspaceId}`}
        backLabel={workspace.name}
        workspaceId={workspaceId}
      />
      <div className="container mx-auto py-8 max-w-4xl">
        <Breadcrumbs 
          items={[
            { label: 'Workspaces', href: '/' },
            { label: workspace.name, href: `/workspace/${workspaceId}` },
            { label: 'Settings' }
          ]}
        />
        <h1 className="text-3xl font-bold mb-6">Workspace Settings</h1>

        <div className="space-y-6">
          <WorkspaceSettings workspace={workspaceData} />

          <Card>
            <CardHeader>
              <CardTitle>Invite Members</CardTitle>
            </CardHeader>
            <CardContent>
              {isOwner ? (
                <InviteMemberForm workspaceId={workspaceId} />
              ) : (
                <p className="text-sm text-gray-600">
                  Only workspace owners can invite new members.
                </p>
              )}
            </CardContent>
          </Card>

        <MemberList
          members={membersData}
          workspaceId={workspaceId}
          currentUserId={user.id}
          isOwner={isOwner}
        />
        </div>
      </div>
    </>
  );
}
