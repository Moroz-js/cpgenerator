'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { createFAQ, updateFAQ } from '@/app/actions/faq';
import { createFAQSchema, updateFAQSchema } from '@/lib/validations/faq';
import type { FAQ } from '@/types/database';

interface FAQEditorProps {
  workspaceId: string;
  faq?: FAQ;
  onSuccess?: (faqId: string) => void;
  onCancel?: () => void;
}

export function FAQEditor({ workspaceId, faq: existingFAQ, onSuccess, onCancel }: FAQEditorProps) {
  const [question, setQuestion] = useState(existingFAQ?.question || '');
  const [answer, setAnswer] = useState(existingFAQ?.answer || '');
  const [category, setCategory] = useState(existingFAQ?.category || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const data = {
      workspaceId,
      question,
      answer,
      category: category || undefined,
      orderIndex: existingFAQ?.orderIndex || 0,
    };

    // Validate
    const schema = existingFAQ ? updateFAQSchema : createFAQSchema;
    const validation = schema.safeParse(
      existingFAQ ? { ...data, id: existingFAQ.id } : data
    );

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = existingFAQ
        ? await updateFAQ({ id: existingFAQ.id, question, answer, category: category || null })
        : await createFAQ(data);

      if (!result.success) {
        setErrors({ general: result.error.message });
        return;
      }

      if (onSuccess) {
        onSuccess(result.data.id);
      }
    } catch (err) {
      setErrors({ general: 'Failed to save FAQ' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category">Category (Optional)</Label>
        <Input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., General, Technical, Pricing"
          disabled={isLoading}
        />
        {errors.category && (
          <p className="text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="question">Question *</Label>
        <Input
          id="question"
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your question"
          disabled={isLoading}
        />
        {errors.question && (
          <p className="text-sm text-red-600">{errors.question}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="answer">Answer *</Label>
        <Textarea
          id="answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Enter the answer"
          disabled={isLoading}
          rows={6}
        />
        {errors.answer && (
          <p className="text-sm text-red-600">{errors.answer}</p>
        )}
      </div>

      {errors.general && (
        <div className="p-3 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-600">{errors.general}</p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : existingFAQ ? 'Update FAQ' : 'Create FAQ'}
        </Button>
      </div>
    </form>
  );
}
