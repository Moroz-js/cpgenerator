'use client';

import { useState, useEffect } from 'react';
import type { ProposalBlock } from '@/types/database';
import type { CasesBlockProps } from '@/lib/builder/block-types';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { HeadingSettings } from './HeadingSettings';

type CasesLayout = 'grid' | 'slider' | 'row';

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

interface CasesBlockSettingsProps {
  block: ProposalBlock;
  onUpdate: (blockId: string, props: Record<string, unknown>) => Promise<void>;
  workspaceId: string;
  // Cases will be loaded from parent
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
}

export function CasesBlockSettings({ block, onUpdate, workspaceId, availableCases = [] }: CasesBlockSettingsProps) {
  const props = block.props as CasesBlockProps;
  const [layout, setLayout] = useState<CasesLayout>(props.layout || 'grid');
  const [showTags, setShowTags] = useState(props.showTags ?? true);
  const [showLinks, setShowLinks] = useState(props.showLinks ?? true);
  const [caseIds, setCaseIds] = useState<string[]>(props.caseIds || []);

  // Debounced save
  const debouncedSave = useDebouncedCallback(
    async (newLayout: CasesLayout, newShowTags: boolean, newShowLinks: boolean, newCaseIds: string[]) => {
      console.log('Saving cases block:', { layout: newLayout, showTags: newShowTags, showLinks: newShowLinks, caseIds: newCaseIds });
      await onUpdate(block.id, {
        layout: newLayout,
        caseIds: newCaseIds,
        showTags: newShowTags,
        showLinks: newShowLinks,
      });
    },
    1000
  );

  // Save on changes
  useEffect(() => {
    debouncedSave(layout, showTags, showLinks, caseIds);
  }, [layout, showTags, showLinks, caseIds, debouncedSave]);

  const addCase = (caseId: string) => {
    if (!caseIds.includes(caseId)) {
      setCaseIds([...caseIds, caseId]);
    }
  };

  const removeCase = (caseId: string) => {
    setCaseIds(caseIds.filter((id) => id !== caseId));
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold">Cases Block</h3>

      {/* Heading settings */}
      <div className="space-y-3">
        <Label className="font-semibold">Заголовок</Label>
        <HeadingSettings
          heading={props.heading}
          onChange={(heading) => {
            onUpdate(block.id, { heading, layout, showTags, showLinks, caseIds });
          }}
        />
      </div>

      {/* Layout selector */}
      <div className="space-y-3">
        <Label>Вариант отображения</Label>
        <RadioGroup value={layout} onValueChange={(v) => setLayout(v as CasesLayout)}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="grid" id="grid" />
            <Label htmlFor="grid" className="font-normal">Сетка</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="slider" id="slider" />
            <Label htmlFor="slider" className="font-normal">Слайдер</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="row" id="row" />
            <Label htmlFor="row" className="font-normal">Список</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <Label>Опции отображения</Label>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="showTags"
            checked={showTags}
            onCheckedChange={(checked: boolean) => setShowTags(checked)}
          />
          <Label htmlFor="showTags" className="font-normal">
            Показывать теги технологий
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <Checkbox
            id="showLinks"
            checked={showLinks}
            onCheckedChange={(checked: boolean) => setShowLinks(checked)}
          />
          <Label htmlFor="showLinks" className="font-normal">
            Показывать ссылки на кейсы
          </Label>
        </div>
      </div>

      {/* Cases selection */}
      <div className="space-y-3">
        <Label>Выбранные кейсы ({caseIds.length})</Label>
        
        {/* Selected cases */}
        {caseIds.length > 0 && (
          <div className="space-y-2">
            {caseIds.map((caseId) => {
              const caseItem = availableCases.find((c) => c.id === caseId);
              return (
                <div
                  key={caseId}
                  className="flex items-center justify-between p-2 border rounded"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {caseItem?.title || caseId}
                    </p>
                    {caseItem?.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {extractTextFromTiptap(caseItem.description)}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => removeCase(caseId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {/* Available cases to add */}
        {availableCases.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Доступные кейсы</Label>
            <div className="max-h-48 overflow-y-auto space-y-1 border rounded p-2">
              {availableCases
                .filter((c) => !caseIds.includes(c.id))
                .map((caseItem) => (
                  <button
                    key={caseItem.id}
                    className="w-full text-left p-2 hover:bg-muted rounded text-sm"
                    onClick={() => addCase(caseItem.id)}
                  >
                    <p className="font-medium">{caseItem.title}</p>
                    {caseItem.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {extractTextFromTiptap(caseItem.description)}
                      </p>
                    )}
                  </button>
                ))}
              {availableCases.filter((c) => !caseIds.includes(c.id)).length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  Все кейсы добавлены
                </p>
              )}
            </div>
          </div>
        )}

        {availableCases.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Нет доступных кейсов. Создайте кейсы в разделе "Кейсы".
          </p>
        )}
      </div>
    </div>
  );
}
