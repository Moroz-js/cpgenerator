'use client';

import type { CasesBlockProps } from '@/lib/builder/block-types';
import type { WorkspaceBrandSettings } from '@/types/database';
import { Globe } from 'lucide-react';
import { BlockHeading } from './BlockHeading';

// Helper to extract text from Tiptap JSON
function extractTextFromTiptap(content: any): string {
  if (typeof content === 'string') {
    try {
      const parsed = JSON.parse(content);
      return extractTextFromTiptap(parsed);
    } catch {
      return content;
    }
  }

  if (!content || typeof content !== 'object') {
    return '';
  }

  if (content.type === 'text') {
    return content.text || '';
  }

  if (Array.isArray(content)) {
    return content.map(extractTextFromTiptap).join('');
  }

  if (content.content && Array.isArray(content.content)) {
    return content.content.map(extractTextFromTiptap).join(' ');
  }

  return '';
}

// App Store icon (Apple)
function AppStoreIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}

// Google Play icon
function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
    </svg>
  );
}

// Helper function to get icon and label based on link type/URL
function getLinkIconAndLabel(link: { type?: string; url: string; label?: string; title?: string }) {
  const lowerUrl = link.url.toLowerCase();
  const type = link.type?.toLowerCase();
  
  if (type === 'app_store' || type === 'appstore' || lowerUrl.includes('apps.apple.com') || lowerUrl.includes('appstore')) {
    return { icon: <AppStoreIcon className="w-4 h-4" />, label: 'App Store' };
  } else if (type === 'google_play' || type === 'googleplay' || lowerUrl.includes('play.google.com') || lowerUrl.includes('googleplay')) {
    return { icon: <GooglePlayIcon className="w-4 h-4" />, label: 'Google Play' };
  } else if (type === 'website' || type === 'web' || lowerUrl.includes('http')) {
    return { icon: <Globe className="w-4 h-4" />, label: 'Website' };
  } else {
    return { icon: <Globe className="w-4 h-4" />, label: 'Link' };
  }
}

interface CasesBlockComponentProps {
  props: CasesBlockProps;
  brand: WorkspaceBrandSettings | null;
  // Cases data would be loaded separately
  cases?: Array<{
    id: string;
    title: string;
    description?: string | any; // Can be string or Tiptap JSON
    technologies?: string[];
    images?: string[];
    links?: Array<{
      type?: string;
      url: string;
      label?: string;
      title?: string; // Database uses 'title' field
    }>;
  }>;
}

export function CasesBlock({ props, brand, cases = [] }: CasesBlockComponentProps) {
  const { heading, layout = 'grid', caseIds = [], showTags = true, showLinks = true } = props;

  // Filter cases by selected IDs
  const selectedCases = cases.filter((c) => caseIds.includes(c.id));

  if (caseIds.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Выберите кейсы в настройках блока
      </div>
    );
  }

  if (selectedCases.length === 0 && caseIds.length > 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Загрузка кейсов... ({caseIds.length} выбрано)
      </div>
    );
  }

  const cardStyle = {
    borderRadius:
      brand?.components?.cardRadius === 'none' ? '0' :
      brand?.components?.cardRadius === 'sm' ? '0.25rem' :
      brand?.components?.cardRadius === 'md' ? '0.5rem' :
      brand?.components?.cardRadius === 'lg' ? '0.75rem' :
      brand?.components?.cardRadius === 'xl' ? '1rem' : '0.5rem',
    boxShadow:
      brand?.components?.shadowSize === 'none' ? 'none' :
      brand?.components?.shadowSize === 'sm' ? '0 1px 2px rgba(0,0,0,0.05)' :
      brand?.components?.shadowSize === 'md' ? '0 4px 6px rgba(0,0,0,0.1)' :
      brand?.components?.shadowSize === 'lg' ? '0 10px 15px rgba(0,0,0,0.1)' :
      brand?.components?.shadowSize === 'xl' ? '0 20px 25px rgba(0,0,0,0.15)' : '0 4px 6px rgba(0,0,0,0.1)',
  };

  // Grid layout
  if (layout === 'grid') {
    return (
      <div className="py-8 px-4">
        {heading?.text && <BlockHeading text={heading.text} align={heading.align} />}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedCases.map((caseItem) => (
            <CaseCard
              key={caseItem.id}
              caseItem={caseItem}
              brand={brand}
              showTags={showTags}
              showLinks={showLinks}
              cardStyle={cardStyle}
            />
          ))}
        </div>
      </div>
    );
  }

  // Slider layout
  if (layout === 'slider') {
    return (
      <div className="py-8 px-4 overflow-x-auto">
        {heading?.text && <BlockHeading text={heading.text} align={heading.align} />}
        <div className="flex gap-6 min-w-max snap-x snap-mandatory">
          {selectedCases.map((caseItem) => (
            <div key={caseItem.id} className="w-[300px] flex-shrink-0 snap-start">
              <CaseCard
                caseItem={caseItem}
                brand={brand}
                showTags={showTags}
                showLinks={showLinks}
                cardStyle={cardStyle}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Row layout (vertical list)
  return (
    <div className="py-8 px-4">
      {heading?.text && <BlockHeading text={heading.text} align={heading.align} />}
      <div className="space-y-6">
        {selectedCases.map((caseItem) => (
          <div
            key={caseItem.id}
            className="flex gap-6 p-4 border"
            style={cardStyle}
          >
            {/* Image */}
            {caseItem.images?.[0] && (
              <div className="w-48 h-32 flex-shrink-0 bg-muted rounded overflow-hidden">
                <img
                  src={caseItem.images[0]}
                  alt={caseItem.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {/* Content */}
            <div className="flex-1">
              <h3
                className="text-lg font-semibold"
                style={{ fontFamily: brand?.typography?.headingFont }}
              >
                {caseItem.title}
              </h3>
              {caseItem.description && (
                <p
                  className="text-sm text-muted-foreground mt-2 line-clamp-2"
                  style={{ fontFamily: brand?.typography?.bodyFont }}
                >
                  {extractTextFromTiptap(caseItem.description)}
                </p>
              )}
              {showTags && caseItem.technologies && caseItem.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {caseItem.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 text-xs rounded"
                      style={{
                        backgroundColor: brand?.colors?.secondary || brand?.colors?.primary || '#3b82f6',
                        color: '#ffffff',
                      }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
              {showLinks && caseItem.links && caseItem.links.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {caseItem.links.map((link, idx) => {
                    const { icon, label } = getLinkIconAndLabel(link);
                    return (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm inline-flex items-center gap-1.5 px-3 py-1.5 border rounded hover:bg-muted transition-colors"
                        style={{ 
                          borderColor: brand?.colors?.primary || '#3b82f6',
                          color: brand?.colors?.primary || '#3b82f6',
                        }}
                      >
                        {icon}
                        <span>{label}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Case Card component
function CaseCard({
  caseItem,
  brand,
  showTags,
  showLinks,
  cardStyle,
}: {
  caseItem: {
    id: string;
    title: string;
    description?: string | any;
    technologies?: string[];
    images?: string[];
    links?: Array<{
      type?: string;
      url: string;
      label?: string;
      title?: string;
    }>;
  };
  brand: WorkspaceBrandSettings | null;
  showTags: boolean;
  showLinks: boolean;
  cardStyle: React.CSSProperties;
}) {
  return (
    <div className="border overflow-hidden" style={cardStyle}>
      {/* Image */}
      {caseItem.images?.[0] && (
        <div className="aspect-video bg-muted">
          <img
            src={caseItem.images[0]}
            alt={caseItem.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {/* Content */}
      <div className="p-4">
        <h3
          className="font-semibold"
          style={{ fontFamily: brand?.typography?.headingFont }}
        >
          {caseItem.title}
        </h3>
        {caseItem.description && (
          <p
            className="text-sm text-muted-foreground mt-2 line-clamp-2"
            style={{ fontFamily: brand?.typography?.bodyFont }}
          >
            {extractTextFromTiptap(caseItem.description)}
          </p>
        )}
        {showTags && caseItem.technologies && caseItem.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {caseItem.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 text-xs rounded"
                style={{
                  backgroundColor: brand?.colors?.secondary || brand?.colors?.primary || '#3b82f6',
                  color: '#ffffff',
                }}
              >
                {tech}
              </span>
            ))}
          </div>
        )}
        {showLinks && caseItem.links && caseItem.links.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {caseItem.links.map((link, idx) => {
              const { icon, label } = getLinkIconAndLabel(link);
              return (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm inline-flex items-center gap-1.5 px-3 py-1.5 border rounded hover:bg-muted transition-colors"
                  style={{ 
                    borderColor: brand?.colors?.primary || '#3b82f6',
                    color: brand?.colors?.primary || '#3b82f6',
                  }}
                >
                  {icon}
                  <span>{label}</span>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
