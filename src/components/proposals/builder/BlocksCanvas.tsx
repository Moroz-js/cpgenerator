'use client';

import type { ProposalBlock, WorkspaceBrandSettings } from '@/types/database';
import { BlockRenderer } from './BlockRenderer';

interface BlocksCanvasProps {
  blocks: ProposalBlock[];
  selectedBlockId: string | null;
  brand: WorkspaceBrandSettings | null;
  onSelectBlock: (blockId: string) => void;
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

export function BlocksCanvas({
  blocks,
  selectedBlockId,
  brand,
  onSelectBlock,
  loomUrl,
  availableCases = [],
  availableFAQItems = [],
}: BlocksCanvasProps) {
  // Apply brand CSS variables
  const brandStyles = brand
    ? {
        '--color-primary': brand.colors.primary,
        '--color-secondary': brand.colors.secondary,
        '--color-background': brand.colors.background,
        '--color-text': brand.colors.text,
        '--font-family': brand.typography.fontFamily,
        '--font-heading': brand.typography.headingFont,
        '--font-body': brand.typography.bodyFont,
        '--card-radius': brand.components.cardRadius,
        '--shadow-size': brand.components.shadowSize,
        fontFamily: brand.typography.fontFamily,
      }
    : {};

  return (
    <div
      className="bg-white overflow-y-auto p-8"
      style={brandStyles as React.CSSProperties}
    >
      <div className="max-w-4xl mx-auto space-y-4">
        {blocks.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Нет блоков. Добавьте первый блок через боковую панель.</p>
          </div>
        ) : (
          blocks.map((block) => {
            const isSelected = block.id === selectedBlockId;

            return (
              <div
                key={block.id}
                className={`p-4 rounded-lg border-2 transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-primary'
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => onSelectBlock(block.id)}
              >
                <BlockRenderer 
                  block={block} 
                  brand={brand} 
                  loomUrl={loomUrl}
                  availableCases={availableCases}
                  availableFAQItems={availableFAQItems}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
