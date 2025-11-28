'use client';

import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEffect } from 'react';
import type { ProposalBlock } from '@/types/database';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

const heroSettingsSchema = z.object({
  title: z.string().min(1, 'Заголовок обязателен'),
  subtitle: z.string().optional(),
  clientName: z.string().optional(),
});

type HeroSettingsInput = z.infer<typeof heroSettingsSchema>;

interface HeroBlockSettingsProps {
  block: ProposalBlock;
  onUpdate: (blockId: string, props: Record<string, unknown>) => Promise<void>;
  loomUrl?: string | null;
  onUpdateLoomUrl?: (url: string) => Promise<void>;
}

export function HeroBlockSettings({
  block,
  onUpdate,
  loomUrl,
  onUpdateLoomUrl,
}: HeroBlockSettingsProps) {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<HeroSettingsInput>({
    resolver: zodResolver(heroSettingsSchema),
    defaultValues: {
      title: (block.props as HeroSettingsInput)?.title || '',
      subtitle: (block.props as HeroSettingsInput)?.subtitle || '',
      clientName: (block.props as HeroSettingsInput)?.clientName || '',
    },
  });

  // Watch form changes and update local state
  const watchedFields = watch();

  useEffect(() => {
    // Update on every change (no debounce needed since it's local only)
    onUpdate(block.id, watchedFields);
  }, [watchedFields.title, watchedFields.subtitle, watchedFields.clientName]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold">Hero Section</h3>

        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">Заголовок *</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Заголовок проекта"
          />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <Label htmlFor="subtitle">Подзаголовок</Label>
          <Textarea
            id="subtitle"
            {...register('subtitle')}
            placeholder="Краткое описание проекта"
            rows={3}
          />
        </div>

        {/* Client Name */}
        <div className="space-y-2">
          <Label htmlFor="clientName">Имя клиента</Label>
          <Input
            id="clientName"
            {...register('clientName')}
            placeholder="Название компании клиента"
          />
        </div>

      </div>

      {/* Loom URL Section */}
      {onUpdateLoomUrl && (
        <div className="space-y-4 pt-4 border-t">
          <h3 className="font-semibold">Видео-презентация</h3>
          <div className="space-y-2">
            <Label htmlFor="loomUrl">Ссылка на Loom видео</Label>
            <Input
              id="loomUrl"
              type="url"
              defaultValue={loomUrl || ''}
              placeholder="https://www.loom.com/share/..."
              onChange={(e) => {
                // Debounce loom URL update
                const value = e.target.value;
                setTimeout(() => onUpdateLoomUrl(value), 1000);
              }}
            />
            <p className="text-xs text-muted-foreground">
              Добавьте ссылку на Loom видео для видео-презентации
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
