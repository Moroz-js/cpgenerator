import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface HeadingSettingsProps {
  heading?: {
    text: string;
    align?: 'left' | 'center' | 'right';
  };
  onChange: (heading: { text: string; align: 'left' | 'center' | 'right' }) => void;
}

export function HeadingSettings({ heading, onChange }: HeadingSettingsProps) {
  const currentHeading = heading || { text: '', align: 'left' as const };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="heading-text">Заголовок блока</Label>
        <Input
          id="heading-text"
          value={currentHeading.text}
          onChange={(e) =>
            onChange({ ...currentHeading, text: e.target.value })
          }
          placeholder="Введите заголовок..."
        />
      </div>

      <div>
        <Label>Выравнивание</Label>
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => onChange({ ...currentHeading, align: 'left' })}
            className={`p-2 border rounded ${
              currentHeading.align === 'left'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
            title="По левому краю"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...currentHeading, align: 'center' })}
            className={`p-2 border rounded ${
              currentHeading.align === 'center'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
            title="По центру"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...currentHeading, align: 'right' })}
            className={`p-2 border rounded ${
              currentHeading.align === 'right'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-accent'
            }`}
            title="По правому краю"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
