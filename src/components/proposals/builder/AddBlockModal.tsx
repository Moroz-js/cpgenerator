'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  blockDefinitions,
  BlockCategory,
  getAllCategories,
  getCategoryLabel,
  getBlocksByCategory,
} from '@/lib/builder/blocks-registry';
import type { BlockType } from '@/lib/builder/block-types';
import {
  Layout,
  Clock,
  Users,
  HelpCircle,
  FileText,
  Images as ImagesIcon,
  Target,
  Presentation,
  Calendar,
  DollarSign,
  MessageCircleQuestion,
  Mail,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Map block types to icons
const blockIcons: Record<string, LucideIcon> = {
  hero_simple: Target,
  cases_grid: Layout,
  cases_slider: Presentation,
  cases_row: Layout,
  timeline_linear: Calendar,
  timeline_vertical: Calendar,
  timeline_phases: Clock,
  team_estimate: Users,
  payment_schedule: DollarSign,
  faq_accordion: MessageCircleQuestion,
  faq_list: HelpCircle,
  contacts_footer: Mail,
  text: FileText,
  gallery: ImagesIcon,
};

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (type: BlockType) => void;
}

export function AddBlockModal({ isOpen, onClose, onAddBlock }: AddBlockModalProps) {
  const handleSelectBlock = (type: BlockType) => {
    onAddBlock(type);
    onClose();
  };

  const categories = getAllCategories();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Добавить блок</DialogTitle>
        </DialogHeader>

        <div className="space-y-8 py-4">
          {categories.map((category) => {
            const blocks = getBlocksByCategory(category);
            if (blocks.length === 0) return null;

            return (
              <div key={category}>
                <h3 className="text-base font-semibold mb-4 text-foreground">
                  {getCategoryLabel(category)}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {blocks.map((block) => {
                    const Icon = blockIcons[block.id] || Layout;

                    return (
                      <Button
                        key={block.id}
                        variant="outline"
                        className="h-auto p-4 flex flex-col items-start gap-2 hover:bg-primary/10 hover:border-primary transition-colors"
                        onClick={() => handleSelectBlock(block.id)}
                      >
                        <Icon className="w-6 h-6 text-primary" />
                        <div className="text-left w-full">
                          <div className="font-medium text-sm mb-1">{block.label}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">
                            {block.description}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
