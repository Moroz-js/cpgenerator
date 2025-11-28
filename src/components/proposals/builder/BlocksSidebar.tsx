'use client';

import type { ProposalBlock } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Copy,
  Trash2,
  Plus,
  Layout,
  Image,
  Clock,
  Users,
  CreditCard,
  HelpCircle,
  Phone,
  FileText,
  Images,
} from 'lucide-react';
import { getBlockDefinition } from '@/lib/builder/blocks-registry';
import type { LucideIcon } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Map block types to icons
const blockIcons: Record<string, LucideIcon> = {
  hero_simple: Layout,
  cases_grid: Image,
  timeline: Clock,
  team_estimate: Users,
  payment: CreditCard,
  faq: HelpCircle,
  contacts: Phone,
  text: FileText,
  gallery: Images,
};

interface BlocksSidebarProps {
  blocks: ProposalBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (blockId: string) => void;
  onDuplicateBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onAddBlock: () => void;
  onReorderBlocks: (newOrder: string[]) => void;
}

// Sortable block item component
function SortableBlockItem({
  block,
  isSelected,
  onSelect,
  onDuplicate,
  onDelete,
}: {
  block: ProposalBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const definition = getBlockDefinition(block.type as any);
  const Icon = blockIcons[block.type] || Layout;

  // Get short description from props
  let description = '';
  if (block.props) {
    if ('title' in block.props && block.props.title) {
      description = String(block.props.title).substring(0, 30);
    } else if ('content' in block.props) {
      description = 'Текстовый блок';
    }
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`p-3 transition-colors ${
        isSelected
          ? 'border-2 border-primary bg-primary/10'
          : 'hover:bg-muted'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Drag handle - Icon */}
        <div
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        </div>

        {/* Content - clickable to select */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={onSelect}
        >
          <div className="font-medium text-sm">
            {definition?.label || block.type}
          </div>
          {description && (
            <div className="text-xs text-muted-foreground truncate">
              {description}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-1 flex-shrink-0">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
          >
            <Copy className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function BlocksSidebar({
  blocks,
  selectedBlockId,
  onSelectBlock,
  onDuplicateBlock,
  onDeleteBlock,
  onAddBlock,
  onReorderBlocks,
}: BlocksSidebarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      const newBlocks = arrayMove(blocks, oldIndex, newIndex);
      const newOrder = newBlocks.map((b) => b.id);
      onReorderBlocks(newOrder);
    }
  };

  return (
    <div className="border-r bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold">Блоки</h2>
      </div>

      {/* Blocks list with drag-n-drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {blocks.map((block) => (
              <SortableBlockItem
                key={block.id}
                block={block}
                isSelected={block.id === selectedBlockId}
                onSelect={() => onSelectBlock(block.id)}
                onDuplicate={() => onDuplicateBlock(block.id)}
                onDelete={() => onDeleteBlock(block.id)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add block button */}
      <div className="p-4 border-t">
        <Button onClick={onAddBlock} className="w-full" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          Добавить блок
        </Button>
      </div>
    </div>
  );
}
