'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import type { ProposalBlock } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Heading2,
} from 'lucide-react';
import { useEffect, useRef, useCallback } from 'react';

interface TextBlockSettingsProps {
  block: ProposalBlock;
  onUpdate: (blockId: string, props: Record<string, unknown>) => Promise<void>;
}

export function TextBlockSettings({
  block,
  onUpdate,
}: TextBlockSettingsProps) {
  const blockProps = block.props as {
    content?: any;
    align?: 'left' | 'center' | 'right';
  };

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debouncedUpdate = useCallback(
    (content: any) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        onUpdate(block.id, {
          content,
          align: blockProps.align || 'left',
        });
      }, 500);
    },
    [block.id, blockProps.align, onUpdate]
  );

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
    ],
    content: blockProps.content || {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
        },
      ],
    },
    onUpdate: ({ editor }) => {
      // Update on every change with debounce
      debouncedUpdate(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[200px] p-4 border rounded-md',
      },
    },
  });

  useEffect(() => {
    if (editor && blockProps.content) {
      const currentContent = editor.getJSON();
      if (JSON.stringify(currentContent) !== JSON.stringify(blockProps.content)) {
        editor.commands.setContent(blockProps.content);
      }
    }
  }, [editor, blockProps.content]);

  const handleAlignChange = (value: string) => {
    const newAlign = value as 'left' | 'center' | 'right';
    onUpdate(block.id, {
      content: editor?.getJSON() || blockProps.content,
      align: newAlign,
    });
  };

  const setLink = () => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);

    if (url === null) return;

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  if (!editor) {
    return <div>Загрузка редактора...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-semibold">Текстовый блок</h3>

        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/30">
          <Button
            type="button"
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant={editor.isActive('link') ? 'default' : 'ghost'}
            size="sm"
            onClick={setLink}
          >
            <Link2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Editor */}
        <EditorContent editor={editor} />
      </div>

      {/* Alignment */}
      <div className="space-y-2 pt-4 border-t">
        <Label>Выравнивание</Label>
        <RadioGroup
          value={blockProps.align || 'left'}
          onValueChange={handleAlignChange}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="left" id="left" />
            <Label htmlFor="left" className="cursor-pointer">
              По левому краю
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="center" id="center" />
            <Label htmlFor="center" className="cursor-pointer">
              По центру
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="right" id="right" />
            <Label htmlFor="right" className="cursor-pointer">
              По правому краю
            </Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}
