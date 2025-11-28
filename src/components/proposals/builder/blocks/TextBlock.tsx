'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import type { TextBlockProps } from '@/lib/builder/block-types';
import type { WorkspaceBrandSettings } from '@/types/database';
import { useEffect } from 'react';

interface TextBlockComponentProps {
  props: TextBlockProps;
  brand: WorkspaceBrandSettings | null;
}

export function TextBlock({ props, brand }: TextBlockComponentProps) {
  const { content, align = 'left' } = props;

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
    ],
    content: content || {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text: 'Добавьте текст в настройках блока',
            },
          ],
        },
      ],
    },
    editable: false,
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none',
      },
    },
  });

  // Update editor content when props change
  useEffect(() => {
    if (editor && content) {
      const currentContent = editor.getJSON();
      // Only update if content actually changed to avoid infinite loops
      if (JSON.stringify(currentContent) !== JSON.stringify(content)) {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  const alignClass =
    align === 'center' ? 'text-center' :
    align === 'right' ? 'text-right' :
    'text-left';

  return (
    <div
      className={`py-6 px-4 ${alignClass}`}
      style={{
        fontFamily: brand?.typography?.bodyFont || 'inherit',
      }}
    >
      <EditorContent editor={editor} />
    </div>
  );
}
