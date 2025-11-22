import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout';
import { FAQList } from '@/components/faq/FAQList';

export default async function FAQPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  // Get workspace
  const { data: workspace } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  if (!workspace) {
    redirect('/');
  }

  // Get FAQ items
  const { data: faqItems } = await supabase
    .from('faq_items')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false });

  const faqs = faqItems?.map((item) => ({
    id: item.id,
    workspaceId: item.workspace_id,
    question: item.question,
    answer: item.answer,
    category: item.category,
    orderIndex: item.order_index,
    createdBy: item.created_by,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  })) || [];

  return (
    <>
      <Header
        workspaceId={workspaceId}
        workspaceName={workspace.name}
      />
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">FAQ Library</h1>
            <p className="text-gray-600">
              Create and manage frequently asked questions for your proposals
            </p>
          </div>

          <FAQList workspaceId={workspaceId} initialFAQs={faqs} />
        </div>
      </div>
    </>
  );
}
