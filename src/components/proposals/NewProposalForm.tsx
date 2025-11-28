'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProposal } from '@/app/actions/proposals';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface NewProposalFormProps {
  workspaceId: string;
}

export function NewProposalForm({ workspaceId }: NewProposalFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Название обязательно');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createProposal({
        workspaceId,
        title: title.trim(),
        clientName: clientName.trim() || undefined,
        status: 'draft',
        selectedCases: [],
        techStack: [],
        faq: [],
        paymentSchedule: [],
        loomVideos: [],
      });

      if (result.success) {
        toast.success('КП создано успешно!');
        router.push(`/workspace/${workspaceId}/proposals/${result.data.id}/builder`);
      } else {
        toast.error(result.error.message);
      }
    } catch (error) {
      console.error('Create proposal error:', error);
      toast.error('Не удалось создать КП');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Основная информация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">
              Название КП <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Разработка веб-приложения для..."
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <Label htmlFor="clientName">Имя клиента</Label>
            <Input
              id="clientName"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="ООО Компания"
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Создание...' : 'Создать и перейти в билдер'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
