import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PublicProposalView } from '@/components/proposals/PublicProposalView';
import type { Metadata } from 'next';
import Script from 'next/script';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();

  // Load public link
  const { data: publicLink } = await supabase
    .from('public_links')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (!publicLink) {
    return {
      title: 'КП не найдено',
    };
  }

  // Get the latest snapshot
  const { data: snapshot } = await supabase
    .from('proposal_snapshots')
    .select('*')
    .eq('public_link_id', publicLink.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!snapshot) {
    return {
      title: 'КП не найдено',
    };
  }
  const brand = snapshot.brand as any;

  return {
    title: brand?.seo?.title || 'Коммерческое предложение',
    description: brand?.seo?.description || '',
    openGraph: {
      title: brand?.seo?.title || 'Коммерческое предложение',
      description: brand?.seo?.description || '',
      images: brand?.seo?.ogImage ? [brand.seo.ogImage] : [],
      type: 'website',
    },
  };
}

export default async function PublicProposalPage({ params }: PageProps) {
  const { slug } = await params;

  console.log('=== Public Proposal Page START ===');
  console.log('Slug:', slug);

  const supabase = await createClient();

  // Load public link
  const { data: publicLink, error: linkError } = await supabase
    .from('public_links')
    .select('*, proposal_id')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  console.log('Public link loaded:', { publicLink: !!publicLink, linkError });

  if (linkError || !publicLink) {
    console.log('Public link not found or inactive');
    notFound();
  }

  // Get the latest snapshot for this public link
  const { data: snapshot, error: snapshotError } = await supabase
    .from('proposal_snapshots')
    .select('*')
    .eq('public_link_id', publicLink.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (snapshotError || !snapshot) {
    console.log('No snapshot found:', snapshotError);
    notFound();
  }

  console.log('Snapshot loaded:', { snapshotId: snapshot.id });
  console.log('=== Public Proposal Page END ===');

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Open+Sans:wght@400;600;700&family=Lato:wght@400;700&family=Montserrat:wght@400;600;700&family=Poppins:wght@400;600;700&display=swap"
        rel="stylesheet"
      />
      <PublicProposalView snapshot={snapshot} proposalId={publicLink.proposal_id} />
    </>
  );
}
