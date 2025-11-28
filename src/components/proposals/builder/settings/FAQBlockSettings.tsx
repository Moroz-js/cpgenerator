'use client';

import { useState, useEffect } from 'react';
import type { ProposalBlock } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { HeadingSettings } from './HeadingSettings';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}

interface FAQBlockSettingsProps {
  block: ProposalBlock;
  onUpdate: (blockId: string, props: Record<string, unknown>) => Promise<void>;
  workspaceId: string;
  availableFAQItems?: FAQItem[];
}

export function FAQBlockSettings({
  block,
  onUpdate,
  availableFAQItems = [],
}: FAQBlockSettingsProps) {
  const blockProps = block.props as {
    heading?: {
      text: string;
      align?: 'left' | 'center' | 'right';
    };
    faqItemIds?: string[];
    layout?: 'accordion' | 'list';
  };

  const [layout, setLayout] = useState<'accordion' | 'list'>(
    blockProps.layout || 'accordion'
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(
    blockProps.faqItemIds || []
  );
  const [searchQuery, setSearchQuery] = useState('');

  const handleLayoutChange = (value: string) => {
    const newLayout = value as 'accordion' | 'list';
    setLayout(newLayout);
    onUpdate(block.id, { faqItemIds: selectedIds, layout: newLayout });
  };

  const handleToggleFAQ = (faqId: string) => {
    const newSelectedIds = selectedIds.includes(faqId)
      ? selectedIds.filter((id) => id !== faqId)
      : [...selectedIds, faqId];

    setSelectedIds(newSelectedIds);
    onUpdate(block.id, { faqItemIds: newSelectedIds, layout });
  };

  const filteredFAQItems = availableFAQItems.filter((item) =>
    item.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedFAQItems = availableFAQItems.filter((item) =>
    selectedIds.includes(item.id)
  );

  // Group by category
  const categories = Array.from(
    new Set(filteredFAQItems.map((item) => item.category || 'Без категории'))
  );

  return (
    <div className="space-y-6">
      {/* Heading settings */}
      <div className="space-y-3">
        <Label className="font-semibold">Заголовок</Label>
        <HeadingSettings
          heading={blockProps.heading}
          onChange={(heading) => onUpdate(block.id, { ...blockProps, heading })}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">FAQ</h3>

        {/* Layout */}
        <div className="space-y-2">
          <Label>Вид отображения</Label>
          <RadioGroup value={layout} onValueChange={handleLayoutChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="accordion" id="accordion" />
              <Label htmlFor="accordion" className="cursor-pointer">
                Аккордеон
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="list" id="list" />
              <Label htmlFor="list" className="cursor-pointer">
                Список
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      {/* FAQ Selection */}
      <div className="space-y-4 pt-4 border-t">
        <div className="space-y-2">
          <Label>Выбрать вопросы</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по вопросам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {availableFAQItems.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Нет доступных FAQ. Создайте их в настройках воркспейса.
          </p>
        )}

        {/* Selected FAQs */}
        {selectedFAQItems.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              Выбрано: {selectedFAQItems.length}
            </Label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedFAQItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-2 p-2 bg-primary/10 rounded text-sm"
                >
                  <Checkbox
                    checked={true}
                    onCheckedChange={() => handleToggleFAQ(item.id)}
                  />
                  <span className="flex-1">{item.question}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available FAQs by Category */}
        {categories.map((category) => {
          const categoryItems = filteredFAQItems.filter(
            (item) => (item.category || 'Без категории') === category
          );

          if (categoryItems.length === 0) return null;

          return (
            <div key={category} className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">
                {category}
              </Label>
              <div className="space-y-2">
                {categoryItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-2 p-2 hover:bg-muted/50 rounded text-sm"
                  >
                    <Checkbox
                      checked={selectedIds.includes(item.id)}
                      onCheckedChange={() => handleToggleFAQ(item.id)}
                    />
                    <div className="flex-1">
                      <p className="font-medium">{item.question}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
