'use client';

import type { HeroBlockProps } from '@/lib/builder/block-types';
import type { WorkspaceBrandSettings } from '@/types/database';
import { Button } from '@/components/ui/button';

interface HeroBlockComponentProps {
  props: HeroBlockProps;
  brand: WorkspaceBrandSettings | null;
  loomUrl?: string | null;
}

export function HeroBlock({ props, brand, loomUrl }: HeroBlockComponentProps) {
  const { title, subtitle, clientName } = props;

  const handleLoomClick = () => {
    if (loomUrl) {
      window.open(loomUrl, '_blank');
    }
  };

  return (
    <div
      className="flex flex-col items-center text-center py-12 px-6 gap-6"
      style={{
        fontFamily: brand?.typography?.headingFont || 'inherit',
      }}
    >
      {/* Client name */}
      {clientName && (
        <p className="text-sm text-muted-foreground">
          {clientName}
        </p>
      )}

      {/* Title */}
      <h1
        className="text-4xl md:text-5xl font-bold leading-tight"
        style={{
          color: brand?.colors?.primary || '#0062ff',
          fontFamily: brand?.typography?.headingFont || 'inherit',
        }}
      >
        {title || 'Заголовок проекта'}
      </h1>

      {/* Subtitle */}
      {subtitle && (
        <p
          className="text-lg md:text-xl max-w-2xl text-foreground"
          style={{
            fontFamily: brand?.typography?.bodyFont || 'inherit',
          }}
        >
          {subtitle}
        </p>
      )}

      {/* Loom Button */}
      {loomUrl && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handleLoomClick}
            style={{
              backgroundColor: '#ffffff',
              borderColor: brand?.colors?.primary || '#0062ff',
              color: brand?.colors?.primary || '#0062ff',
            }}
          >
            Смотреть Loom презентацию
          </Button>
        </div>
      )}
    </div>
  );
}
