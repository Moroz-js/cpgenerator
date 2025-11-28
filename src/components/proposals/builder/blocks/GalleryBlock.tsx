'use client';

import type { GalleryBlockProps } from '@/lib/builder/block-types';
import type { WorkspaceBrandSettings } from '@/types/database';
import Image from 'next/image';
import { BlockHeading } from './BlockHeading';

interface GalleryBlockComponentProps {
  props: GalleryBlockProps;
  brand: WorkspaceBrandSettings | null;
}

export function GalleryBlock({ props, brand }: GalleryBlockComponentProps) {
  const { heading, imageUrls = [] } = props;

  if (imageUrls.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Добавьте изображения в настройках блока
      </div>
    );
  }

  // Determine grid layout based on number of images
  const getGridClass = () => {
    const count = imageUrls.length;
    if (count === 1) return 'grid-cols-1';
    if (count === 2 || count === 3) return 'grid-cols-2 md:grid-cols-3';
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  const cardRadius = brand?.components?.cardRadius || 'md';
  const radiusClass = 
    cardRadius === 'none' ? 'rounded-none' :
    cardRadius === 'sm' ? 'rounded-sm' :
    cardRadius === 'lg' ? 'rounded-lg' :
    cardRadius === 'xl' ? 'rounded-xl' :
    'rounded-md';

  return (
    <div className="w-full py-6">
      {heading?.text && <BlockHeading text={heading.text} align={heading.align} />}
      <div className={`grid ${getGridClass()} gap-4`}>
        {imageUrls.map((url, index) => (
          <div
            key={index}
            className={`relative aspect-video overflow-hidden ${radiusClass}`}
          >
            <Image
              src={url}
              alt={`Gallery image ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
