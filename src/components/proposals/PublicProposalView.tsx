'use client';

import { useState } from 'react';
import { BlockRenderer } from './builder/BlockRenderer';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import type { ProposalBlock, WorkspaceBrandSettings } from '@/types/database';

interface PublicProposalViewProps {
  snapshot: {
    id: string;
    brand: any;
    blocks: any[];
    meta: any;
  };
  proposalId: string;
}

export function PublicProposalView({ snapshot, proposalId }: PublicProposalViewProps) {
  const brand = snapshot.brand as WorkspaceBrandSettings | null;
  const blocks = snapshot.blocks as ProposalBlock[];
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);

    try {
      const response = await fetch(`/api/proposals/${proposalId}/pdf`);

      if (!response.ok) {
        alert('Не удалось сгенерировать PDF');
        return;
      }

      // Download the PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `proposal.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('PDF download error:', error);
      alert('Не удалось скачать PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

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
      className="min-h-screen bg-white"
      style={brandStyles as React.CSSProperties}
    >
      {/* Download PDF button - fixed position */}
      <div className="fixed top-4 right-4 z-50 print:hidden">
        <Button
          onClick={handleDownloadPDF}
          disabled={isGeneratingPDF}
          size="sm"
          className="shadow-lg"
        >
          <Download className="w-4 h-4 mr-2" />
          {isGeneratingPDF ? 'Генерация...' : 'Скачать PDF'}
        </Button>
      </div>

      <div className="max-w-6xl mx-auto">
        {blocks.map((block) => (
          <div key={block.id}>
            <BlockRenderer block={block} brand={brand} />
          </div>
        ))}
      </div>
    </div>
  );
}
