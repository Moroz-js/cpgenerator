'use client';

import { useState, useEffect } from 'react';
import type { ProposalBlock } from '@/types/database';
import type { TimelineBlockProps } from '@/lib/builder/block-types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Plus, Trash2 } from 'lucide-react';
import { HeadingSettings } from './HeadingSettings';

interface TimelineItem {
  title: string;
  date?: string;
  description?: string;
}

interface TimelineBlockSettingsProps {
  block: ProposalBlock;
  onUpdate: (blockId: string, props: Record<string, unknown>) => Promise<void>;
}

type TimelineVariant = 'linear' | 'vertical' | 'phases';

export function TimelineBlockSettings({ block, onUpdate }: TimelineBlockSettingsProps) {
  const props = block.props as TimelineBlockProps;
  const [variant, setVariant] = useState<TimelineVariant>(props.variant || 'linear');
  const [items, setItems] = useState<TimelineItem[]>(props.items || []);

  // Update local state on changes
  useEffect(() => {
    onUpdate(block.id, { variant, items });
  }, [variant, items]);

  const addItem = () => {
    setItems([...items, { title: `Этап ${items.length + 1}`, date: '', description: '' }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof TimelineItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold">Timeline</h3>

      {/* Heading settings */}
      <div className="space-y-3">
        <Label className="font-semibold">Заголовок</Label>
        <HeadingSettings
          heading={props.heading}
          onChange={(heading) => {
            onUpdate(block.id, { heading, variant, items });
          }}
        />
      </div>

      {/* Variant selector */}
      <div className="space-y-3">
        <Label>Вариант отображения</Label>
        <RadioGroup value={variant} onValueChange={(v) => setVariant(v as TimelineVariant)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="linear" id="linear" />
            <Label htmlFor="linear" className="font-normal">Горизонтальный</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="vertical" id="vertical" />
            <Label htmlFor="vertical" className="font-normal">Вертикальный</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="phases" id="phases" />
            <Label htmlFor="phases" className="font-normal">Карточки фаз</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Этапы ({items.length})</Label>
          <Button variant="outline" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" />
            Добавить
          </Button>
        </div>

        {items.map((item, index) => (
          <div key={index} className="p-4 border rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Этап {index + 1}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Название *</Label>
              <Input
                value={item.title}
                onChange={(e) => updateItem(index, 'title', e.target.value)}
                placeholder="Название этапа"
              />
            </div>

            <div className="space-y-2">
              <Label>Дата</Label>
              <Input
                type="text"
                value={item.date || ''}
                onChange={(e) => updateItem(index, 'date', e.target.value)}
                placeholder="Например: Январь 2025"
              />
            </div>

            <div className="space-y-2">
              <Label>Описание</Label>
              <Textarea
                value={item.description || ''}
                onChange={(e) => updateItem(index, 'description', e.target.value)}
                placeholder="Описание этапа"
                rows={2}
              />
            </div>
          </div>
        ))}

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Нет этапов. Нажмите "Добавить" чтобы создать первый этап.
          </p>
        )}
      </div>
    </div>
  );
}
