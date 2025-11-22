'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { FAQ } from '@/types/database';

interface FAQCardProps {
  faq: FAQ;
  onEdit?: (faq: FAQ) => void;
  onDelete?: (id: string) => void;
}

export function FAQCard({ faq, onEdit, onDelete }: FAQCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 pt-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 space-y-2">
            {faq.category && (
              <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {faq.category}
              </span>
            )}
            <h3 className="font-semibold text-lg">{faq.question}</h3>
            <p className="text-gray-600 whitespace-pre-wrap">{faq.answer}</p>
          </div>
          
          <div className="flex gap-2">
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(faq)}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(faq.id)}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
