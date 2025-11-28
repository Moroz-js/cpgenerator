'use client';

import type { ProposalBlock, WorkspaceBrandSettings } from '@/types/database';
import { HeroBlockSettings } from './settings/HeroBlockSettings';
import { TimelineBlockSettings } from './settings/TimelineBlockSettings';
import { CasesBlockSettings } from './settings/CasesBlockSettings';
import { TeamEstimateBlockSettings } from './settings/TeamEstimateBlockSettings';
import { PaymentBlockSettings } from './settings/PaymentBlockSettings';
import { FAQBlockSettings } from './settings/FAQBlockSettings';
import { FooterBlockSettings } from './settings/FooterBlockSettings';
import { TextBlockSettings } from './settings/TextBlockSettings';
import { GalleryBlockSettings } from './settings/GalleryBlockSettings';

interface BlockSettingsPanelProps {
  block: ProposalBlock | null;
  brand: WorkspaceBrandSettings | null;
  onUpdate: (blockId: string, props: Record<string, unknown>) => Promise<void>;
  loomUrl?: string | null;
  onUpdateLoomUrl?: (url: string) => Promise<void>;
  workspaceId: string;
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

export function BlockSettingsPanel({
  block,
  brand,
  onUpdate,
  loomUrl,
  onUpdateLoomUrl,
  workspaceId,
  availableCases = [],
  availableFAQItems = [],
}: BlockSettingsPanelProps) {
  if (!block) {
    return (
      <div className="border-l bg-muted/30 p-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Настройки блока</h2>
        <p className="text-sm text-muted-foreground">
          Выберите блок для редактирования
        </p>
      </div>
    );
  }

  const renderSettings = () => {
    switch (block.type) {
      case 'hero_simple':
        return (
          <HeroBlockSettings
            block={block}
            onUpdate={onUpdate}
            loomUrl={loomUrl}
            onUpdateLoomUrl={onUpdateLoomUrl}
          />
        );

      case 'timeline':
      case 'timeline_linear':
      case 'timeline_vertical':
      case 'timeline_phases':
        return (
          <TimelineBlockSettings
            block={block}
            onUpdate={onUpdate}
          />
        );

      case 'cases_grid':
      case 'cases_slider':
      case 'cases_row':
        return (
          <CasesBlockSettings
            block={block}
            onUpdate={onUpdate}
            workspaceId={workspaceId}
            availableCases={availableCases}
          />
        );

      case 'team_estimate':
        return (
          <TeamEstimateBlockSettings
            block={block}
            onUpdate={onUpdate}
          />
        );

      case 'payment':
      case 'payment_schedule':
        return (
          <PaymentBlockSettings
            block={block}
            onUpdate={onUpdate}
          />
        );

      case 'faq':
      case 'faq_accordion':
      case 'faq_list':
        return (
          <FAQBlockSettings
            block={block}
            onUpdate={onUpdate}
            workspaceId={workspaceId}
            availableFAQItems={availableFAQItems}
          />
        );

      case 'contacts_footer':
        return (
          <FooterBlockSettings
            block={block}
            onUpdate={onUpdate}
          />
        );

      case 'text':
        return (
          <TextBlockSettings
            block={block}
            onUpdate={onUpdate}
          />
        );

      case 'gallery':
        return (
          <GalleryBlockSettings
            block={block}
            onUpdate={onUpdate}
          />
        );

      default:
        return (
          <div className="space-y-4">
            <h3 className="font-semibold">Неизвестный блок</h3>
            <p className="text-sm text-muted-foreground">
              Тип: {block.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="border-l bg-muted/30 p-6 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Настройки блока</h2>
      {renderSettings()}
    </div>
  );
}
