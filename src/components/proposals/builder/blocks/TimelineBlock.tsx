'use client';

import type { TimelineBlockProps } from '@/lib/builder/block-types';
import type { WorkspaceBrandSettings } from '@/types/database';
import { BlockHeading } from './BlockHeading';

interface TimelineBlockComponentProps {
  props: TimelineBlockProps;
  brand: WorkspaceBrandSettings | null;
}

export function TimelineBlock({ props, brand }: TimelineBlockComponentProps) {
  const { heading, variant = 'linear', items = [] } = props;

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Добавьте этапы в настройках блока
      </div>
    );
  }

  // Linear variant - horizontal timeline
  if (variant === 'linear') {
    return (
      <div className="py-8 px-4 overflow-x-auto">
        {heading?.text && <BlockHeading text={heading.text} align={heading.align} />}
        <div className="flex items-start gap-4 min-w-max">
          {items.map((item, index) => (
            <div key={index} className="flex flex-col items-center min-w-[200px]">
              {/* Dot and line */}
              <div className="flex items-center w-full">
                {index > 0 && (
                  <div
                    className="flex-1 h-0.5"
                    style={{ backgroundColor: brand?.colors?.primary || '#3b82f6' }}
                  />
                )}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0"
                  style={{ backgroundColor: brand?.colors?.primary || '#3b82f6' }}
                />
                {index < items.length - 1 && (
                  <div
                    className="flex-1 h-0.5"
                    style={{ backgroundColor: brand?.colors?.primary || '#3b82f6' }}
                  />
                )}
              </div>
              {/* Content */}
              <div className="mt-4 text-center">
                <h4
                  className="font-semibold"
                  style={{ fontFamily: brand?.typography?.headingFont }}
                >
                  {item.title}
                </h4>
                {item.date && (
                  <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
                )}
                {item.description && (
                  <p
                    className="text-sm mt-2 max-w-[180px]"
                    style={{ fontFamily: brand?.typography?.bodyFont }}
                  >
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vertical variant
  if (variant === 'vertical') {
    return (
      <div className="py-8 px-4">
        {heading?.text && <BlockHeading text={heading.text} align={heading.align} />}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="absolute left-2 top-0 bottom-0 w-0.5"
            style={{ backgroundColor: brand?.colors?.primary || '#3b82f6' }}
          />
          {/* Items */}
          <div className="space-y-8">
            {items.map((item, index) => (
              <div key={index} className="flex gap-6 relative">
                {/* Dot */}
                <div
                  className="w-4 h-4 rounded-full flex-shrink-0 z-10"
                  style={{ backgroundColor: brand?.colors?.primary || '#3b82f6' }}
                />
                {/* Content */}
                <div className="flex-1 pb-2">
                  <h4
                    className="font-semibold"
                    style={{ fontFamily: brand?.typography?.headingFont }}
                  >
                    {item.title}
                  </h4>
                  {item.date && (
                    <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
                  )}
                  {item.description && (
                    <p
                      className="text-sm mt-2"
                      style={{ fontFamily: brand?.typography?.bodyFont }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Phases variant - numbered cards
  return (
    <div className="py-8 px-4">
      {heading?.text && <BlockHeading text={heading.text} align={heading.align} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-6 border rounded-lg"
            style={{
              borderRadius: brand?.components?.cardRadius === 'none' ? '0' :
                brand?.components?.cardRadius === 'sm' ? '0.25rem' :
                brand?.components?.cardRadius === 'md' ? '0.5rem' :
                brand?.components?.cardRadius === 'lg' ? '0.75rem' :
                brand?.components?.cardRadius === 'xl' ? '1rem' : '0.5rem',
            }}
          >
            {/* Phase number */}
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-4"
              style={{
                backgroundColor: brand?.colors?.primary || '#3b82f6',
                color: brand?.colors?.background || '#ffffff',
              }}
            >
              {index + 1}
            </div>
            {/* Content */}
            <h4
              className="font-semibold"
              style={{ fontFamily: brand?.typography?.headingFont }}
            >
              {item.title}
            </h4>
            {item.date && (
              <p className="text-sm text-muted-foreground mt-1">{item.date}</p>
            )}
            {item.description && (
              <p
                className="text-sm mt-2"
                style={{ fontFamily: brand?.typography?.bodyFont }}
              >
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
