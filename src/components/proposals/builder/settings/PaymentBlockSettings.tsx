'use client';

import { useState, useRef, useCallback } from 'react';
import type { ProposalBlock } from '@/types/database';
import type { PaymentItem } from '@/lib/builder/block-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus } from 'lucide-react';
import { HeadingSettings } from './HeadingSettings';

interface PaymentBlockSettingsProps{
  block: ProposalBlock;
  onUpdate: (blockId: string, props: Record<string, unknown>) => Promise<void>;
}

export function PaymentBlockSettings({
  block,
  onUpdate,
}: PaymentBlockSettingsProps) {
  const blockProps = block.props as {
    heading?: {
      text: string;
      align?: 'left' | 'center' | 'right';
    };
    items?: PaymentItem[];
    currency?: string;
  };

  const [items, setItems] = useState<PaymentItem[]>(blockProps.items || []);
  const [currency, setCurrency] = useState(blockProps.currency || 'RUB');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdate = useCallback(
    (newItems: PaymentItem[], newCurrency: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onUpdate(block.id, {
          items: newItems,
          currency: newCurrency,
        });
      }, 500); // Reduced from 5000ms to 500ms for faster updates
    },
    [block.id, onUpdate]
  );

  const handleAddItem = () => {
    const newItems = [
      ...items,
      { label: 'Новый платёж', amount: 0 },
    ];
    setItems(newItems);
    onUpdate(block.id, { items: newItems, currency });
  };

  const handleUpdateItem = (
    index: number,
    field: keyof PaymentItem,
    value: string | number
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
    debouncedUpdate(newItems, currency);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    onUpdate(block.id, { items: newItems, currency });
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    debouncedUpdate(items, value);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="space-y-6">
      {/* Heading settings */}
      <div className="space-y-3">
        <Label className="font-semibold">Заголовок</Label>
        <HeadingSettings
          heading={blockProps.heading}
          onChange={(heading) => {
            onUpdate(block.id, {
              heading,
              items,
              currency,
            });
          }}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">График платежей</h3>

        {/* Currency */}
        <div className="space-y-2">
          <Label htmlFor="currency">Валюта</Label>
          <Input
            id="currency"
            value={currency}
            onChange={(e) => handleCurrencyChange(e.target.value)}
            placeholder="RUB"
          />
          <p className="text-xs text-muted-foreground">
            Например: RUB, USD, EUR
          </p>
        </div>
      </div>

      {/* Payment Items */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Платежи</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddItem}
          >
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>

        {items.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Нет платежей. Нажмите "Добавить" чтобы создать.
          </p>
        )}

        {items.map((item, index) => (
          <div
            key={index}
            className="space-y-3 p-4 border rounded-lg bg-muted/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Платёж #{index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteItem(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Название</Label>
              <Input
                value={item.label}
                onChange={(e) =>
                  handleUpdateItem(index, 'label', e.target.value)
                }
                placeholder="Например: Предоплата 50%"
              />
            </div>

            <div className="space-y-2">
              <Label>Дата (опционально)</Label>
              <Input
                type="date"
                value={item.date || ''}
                onChange={(e) =>
                  handleUpdateItem(index, 'date', e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Сумма</Label>
              <Input
                type="number"
                min="0"
                value={item.amount}
                onChange={(e) =>
                  handleUpdateItem(index, 'amount', Number(e.target.value))
                }
              />
            </div>
          </div>
        ))}

        {/* Total Amount */}
        {items.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between font-bold">
              <span>Общая сумма:</span>
              <span className="text-primary">
                {totalAmount.toLocaleString()} {currency}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
