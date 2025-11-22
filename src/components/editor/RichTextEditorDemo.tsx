'use client';

import { useState } from 'react';
import { RichTextEditor } from './RichTextEditor';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function RichTextEditorDemo() {
  const [content, setContent] = useState('');
  const [showJson, setShowJson] = useState(false);

  const handleChange = (newContent: string) => {
    setContent(newContent);
  };

  return (
    <div className="space-y-4">
      <RichTextEditor
        content={content}
        onChange={handleChange}
        placeholder="Start typing to test the rich text editor..."
      />

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowJson(!showJson)}
        >
          {showJson ? 'Hide' : 'Show'} JSON Output
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setContent('')}
        >
          Clear Content
        </Button>
      </div>

      {showJson && content && (
        <Card className="p-4 bg-gray-50">
          <p className="text-xs font-semibold text-gray-600 mb-2">JSON Output:</p>
          <pre className="text-xs overflow-auto max-h-64 bg-white p-3 rounded border">
            {JSON.stringify(JSON.parse(content), null, 2)}
          </pre>
        </Card>
      )}
    </div>
  );
}
