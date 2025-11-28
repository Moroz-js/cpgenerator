'use client';

import { useState, useRef, useCallback } from 'react';
import type { ProposalBlock } from '@/types/database';
import type { TeamMember } from '@/lib/builder/block-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus } from 'lucide-react';
import { HeadingSettings } from './HeadingSettings';

interface TeamEstimateBlockSettingsProps {
  block: ProposalBlock;
  onUpdate: (blockId: string, props: Record<string, unknown>) => Promise<void>;
}

export function TeamEstimateBlockSettings({
  block,
  onUpdate,
}: TeamEstimateBlockSettingsProps) {
  const blockProps = block.props as {
    heading?: {
      text: string;
      align?: 'left' | 'center' | 'right';
    };
    members?: TeamMember[];
    currency?: string;
    showTotal?: boolean;
  };

  const [members, setMembers] = useState<TeamMember[]>(
    blockProps.members || []
  );
  const [currency, setCurrency] = useState(blockProps.currency || 'RUB');
  const [showTotal, setShowTotal] = useState(blockProps.showTotal ?? true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdate = useCallback(
    (newMembers: TeamMember[], newCurrency: string, newShowTotal: boolean) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onUpdate(block.id, {
          members: newMembers,
          currency: newCurrency,
          showTotal: newShowTotal,
        });
      }, 5000);
    },
    [block.id, onUpdate]
  );

  const handleAddMember = () => {
    const newMembers = [
      ...members,
      { role: 'Новая роль', qty: 1, rate: 0 },
    ];
    setMembers(newMembers);
    onUpdate(block.id, { members: newMembers, currency, showTotal });
  };

  const handleUpdateMember = (
    index: number,
    field: keyof TeamMember,
    value: string | number
  ) => {
    const newMembers = [...members];
    newMembers[index] = { ...newMembers[index], [field]: value };
    setMembers(newMembers);
    debouncedUpdate(newMembers, currency, showTotal);
  };

  const handleDeleteMember = (index: number) => {
    const newMembers = members.filter((_, i) => i !== index);
    setMembers(newMembers);
    onUpdate(block.id, { members: newMembers, currency, showTotal });
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    debouncedUpdate(members, value, showTotal);
  };

  const handleShowTotalChange = (checked: boolean) => {
    setShowTotal(checked);
    onUpdate(block.id, { members, currency, showTotal: checked });
  };

  const grandTotal = members.reduce(
    (sum, member) => sum + member.qty * member.rate,
    0
  );

  return (
    <div className="space-y-6">
      {/* Heading settings */}
      <div className="space-y-3">
        <Label className="font-semibold">Заголовок</Label>
        <HeadingSettings
          heading={blockProps.heading}
          onChange={(heading) => {
            onUpdate(block.id, {
              ...blockProps,
              heading,
              members,
              currency,
              showTotal,
            });
          }}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Оценка команды</h3>

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

        {/* Show Total */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="showTotal"
            checked={showTotal}
            onCheckedChange={handleShowTotalChange}
          />
          <Label htmlFor="showTotal" className="cursor-pointer">
            Показывать общую сумму
          </Label>
        </div>
      </div>

      {/* Members Table */}
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Специалисты</h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddMember}
          >
            <Plus className="h-4 w-4 mr-1" />
            Добавить
          </Button>
        </div>

        {members.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Нет специалистов. Нажмите "Добавить" чтобы создать.
          </p>
        )}

        {members.map((member, index) => (
          <div
            key={index}
            className="space-y-3 p-4 border rounded-lg bg-muted/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Специалист #{index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteMember(index)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Роль</Label>
              <Input
                value={member.role}
                onChange={(e) =>
                  handleUpdateMember(index, 'role', e.target.value)
                }
                placeholder="Например: Frontend разработчик"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Количество</Label>
                <Input
                  type="number"
                  min="0"
                  value={member.qty}
                  onChange={(e) =>
                    handleUpdateMember(index, 'qty', Number(e.target.value))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Ставка</Label>
                <Input
                  type="number"
                  min="0"
                  value={member.rate}
                  onChange={(e) =>
                    handleUpdateMember(index, 'rate', Number(e.target.value))
                  }
                />
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Итого:</span>
                <span className="font-medium">
                  {(member.qty * member.rate).toLocaleString()} {currency}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* Grand Total */}
        {members.length > 0 && (
          <div className="pt-4 border-t">
            <div className="flex justify-between font-bold">
              <span>Общая сумма:</span>
              <span className="text-primary">
                {grandTotal.toLocaleString()} {currency}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
