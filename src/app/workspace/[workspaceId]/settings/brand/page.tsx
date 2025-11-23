import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getWorkspaceBrandSettings } from '@/app/actions/brand';
import { BrandSettingsForm, BrandPreview } from '@/components/brand';
import { Header, Breadcrumbs } from '@/components/layout';

interface BrandSettingsPageProps {
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function BrandSettingsPage({ params }: BrandSettingsPageProps) {
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

  // Check if user is member of workspace
  const { data: membership } = await supabase
    .from('workspace_members')
    .select('id, role')
    .eq('workspace_id', workspaceId)
    .eq('user_id', user.id)
    .single();

  if (!membership) {
    redirect('/');
  }

  // Get brand settings
  const brandResult = await getWorkspaceBrandSettings(workspaceId);
  const brandSettings = brandResult.success ? brandResult.data : null;

  return (
    <>
      <Header 
        user={{
          email: user.email!,
          fullName: user.user_metadata?.full_name,
        }}
        showBackButton
        backHref={`/workspace/${workspaceId}/settings`}
        backLabel="Settings"
        workspaceId={workspaceId}
      />
      <div className="container mx-auto py-8 max-w-7xl">
        <Breadcrumbs 
          items={[
            { label: 'Workspaces', href: '/' },
            { label: workspace.name, href: `/workspace/${workspaceId}` },
            { label: 'Settings', href: `/workspace/${workspaceId}/settings` },
            { label: 'Brand' }
          ]}
        />
        <h1 className="text-3xl font-bold mb-6">Brand Settings</h1>
        <p className="text-gray-600 mb-8">
          Customize the appearance of your commercial proposals with your brand colors, fonts, and logo.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form on the left */}
          <div>
            <BrandSettingsForm 
              workspaceId={workspaceId}
              initialSettings={brandSettings}
            />
          </div>

          {/* Preview on the right */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <BrandPreview />
          </div>
        </div>
      </div>
    </>
  );
}
