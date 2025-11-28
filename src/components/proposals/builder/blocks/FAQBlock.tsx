'use client';

import type { FAQBlockProps } from '@/lib/builder/block-types';
import type { WorkspaceBrandSettings } from '@/types/database';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BlockHeading } from './BlockHeading';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQBlockComponentProps {
  props: FAQBlockProps;
  brand: WorkspaceBrandSettings | null;
  faqItems?: FAQItem[];
}

export function FAQBlock({
  props,
  brand,
  faqItems = [],
}: FAQBlockComponentProps) {
  const { heading, layout = 'accordion', faqItemIds = [] } = props;

  if (faqItems.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Добавьте FAQ в настройках блока
      </div>
    );
  }

  if (layout === 'accordion') {
    return (
      <div className="w-full">
        {heading?.text && <BlockHeading text={heading.text} align={heading.align} />}
        <div
          style={{
            fontFamily: brand?.typography?.bodyFont || 'inherit',
          }}
        >
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item) => (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger
                  className="text-left"
                  style={{
                    fontFamily: brand?.typography?.headingFont || 'inherit',
                  }}
                >
                  {item.question}
                </AccordionTrigger>
                <AccordionContent
                  style={{
                    fontFamily: brand?.typography?.bodyFont || 'inherit',
                  }}
                >
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    );
  }

  // List layout
  return (
    <div className="w-full space-y-6">
      {heading?.text && <BlockHeading text={heading.text} align={heading.align} />}
      <div
        style={{
          fontFamily: brand?.typography?.bodyFont || 'inherit',
        }}
      >
        {faqItems.map((item) => (
          <div key={item.id} className="space-y-2">
            <h4
              className="font-semibold text-lg"
              style={{
                color: brand?.colors?.primary || '#0062ff',
                fontFamily: brand?.typography?.headingFont || 'inherit',
              }}
            >
              {item.question}
            </h4>
            <p className="text-muted-foreground">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
