import type { ProposalBlock, WorkspaceBrandSettings } from '@/types/database';
import type { HeroBlockProps, TimelineBlockProps, CasesBlockProps, TextBlockProps, TeamEstimateBlockProps, PaymentBlockProps, FAQBlockProps, FooterBlockProps, GalleryBlockProps } from '@/lib/builder/block-types';
import { HeroBlock } from './blocks/HeroBlock';
import { TimelineBlock } from './blocks/TimelineBlock';
import { CasesBlock } from './blocks/CasesBlock';
import { TextBlock } from './blocks/TextBlock';
import { TeamEstimateBlock } from './blocks/TeamEstimateBlock';
import { PaymentBlock } from './blocks/PaymentBlock';
import { FAQBlock } from './blocks/FAQBlock';
import { FooterBlock } from './blocks/FooterBlock';
import { GalleryBlock } from './blocks/GalleryBlock';

interface BlockRendererProps {
  block: ProposalBlock;
  brand: WorkspaceBrandSettings | null;
  loomUrl?: string | null;
  availableCases?: Array<{
    id: string;
    title: string;
    description?: string;
    technologies?: string[];
    images?: string[];
    links?: Array<{
      type?: string;
      url: string;
      label?: string;
    }>;
  }>;
  availableFAQItems?: Array<{
    id: string;
    question: string;
    answer: string;
    category?: string;
  }>;
}

export function BlockRenderer({ block, brand, loomUrl, availableCases = [], availableFAQItems = [] }: BlockRendererProps) {
  switch (block.type) {
    case 'hero_simple':
      return (
        <HeroBlock
          props={block.props as HeroBlockProps}
          brand={brand}
          loomUrl={loomUrl}
        />
      );

    case 'cases_grid':
    case 'cases_slider':
    case 'cases_row':
      const casesProps = block.props as any;
      // Use resolved cases from props if available (public view), otherwise use availableCases (builder)
      const casesToUse = casesProps.cases || availableCases;
      return (
        <CasesBlock
          props={block.props as CasesBlockProps}
          brand={brand}
          cases={casesToUse}
        />
      );

    case 'timeline':
    case 'timeline_linear':
    case 'timeline_vertical':
    case 'timeline_phases':
      return (
        <TimelineBlock
          props={block.props as TimelineBlockProps}
          brand={brand}
        />
      );

    case 'team_estimate':
      return (
        <TeamEstimateBlock
          props={block.props as TeamEstimateBlockProps}
          brand={brand}
        />
      );

    case 'payment':
    case 'payment_schedule':
      return (
        <PaymentBlock
          props={block.props as PaymentBlockProps}
          brand={brand}
        />
      );

    case 'faq':
    case 'faq_accordion':
    case 'faq_list':
      const faqProps = block.props as any;
      // Use resolved FAQ items from props if available (public view), otherwise filter from availableFAQItems (builder)
      const faqItemsToUse = faqProps.faqItems || availableFAQItems.filter((item) =>
        faqProps.faqItemIds?.includes(item.id)
      );
      return (
        <FAQBlock
          props={block.props as FAQBlockProps}
          brand={brand}
          faqItems={faqItemsToUse}
        />
      );

    case 'contacts_footer':
      return (
        <FooterBlock
          props={block.props as FooterBlockProps}
          brand={brand}
        />
      );

    case 'text':
      return (
        <TextBlock
          props={block.props as TextBlockProps}
          brand={brand}
        />
      );

    case 'gallery':
      return (
        <GalleryBlock
          props={block.props as GalleryBlockProps}
          brand={brand}
        />
      );

    default:
      return (
        <div className="border border-dashed rounded-lg p-6 text-center">
          <p className="text-muted-foreground">Unknown block type: {block.type}</p>
        </div>
      );
  }
}
