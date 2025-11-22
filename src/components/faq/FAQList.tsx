'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FAQCard } from './FAQCard';
import { FAQEditor } from './FAQEditor';
import { deleteFAQ } from '@/app/actions/faq';
import type { FAQ } from '@/types/database';

interface FAQListProps {
  workspaceId: string;
  initialFAQs: FAQ[];
}

export function FAQList({ workspaceId, initialFAQs }: FAQListProps) {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFAQs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | undefined>();
  const [filter, setFilter] = useState<string>('');

  const handleCreate = () => {
    setEditingFAQ(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ?')) return;

    const result = await deleteFAQ(id);
    if (result.success) {
      setFaqs(faqs.filter((f) => f.id !== id));
    }
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingFAQ(undefined);
    // Refresh the page to get updated data
    window.location.reload();
  };

  const categories = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)));
  const filteredFAQs = filter
    ? faqs.filter((f) => f.category === filter)
    : faqs;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={filter === '' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('')}
          >
            All ({faqs.length})
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={filter === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(category || '')}
            >
              {category} ({faqs.filter((f) => f.category === category).length})
            </Button>
          ))}
        </div>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" />
          New FAQ
        </Button>
      </div>

      {filteredFAQs.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-gray-500 mb-4">No FAQ items yet</p>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            Create your first FAQ
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <FAQCard
              key={faq.id}
              faq={faq}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingFAQ ? 'Edit FAQ' : 'Create New FAQ'}
            </DialogTitle>
          </DialogHeader>
          <FAQEditor
            workspaceId={workspaceId}
            faq={editingFAQ}
            onSuccess={handleSuccess}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
