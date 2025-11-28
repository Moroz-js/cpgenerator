'use client';

import { useState } from 'react';
import type { ProposalBlock } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Trash2, Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import Image from 'next/image';
import { HeadingSettings } from './HeadingSettings';

interface GalleryBlockSettingsProps {
  block: ProposalBlock;
  onUpdate: (blockId: string, props: Record<string, unknown>) => Promise<void>;
}

export function GalleryBlockSettings({
  block,
  onUpdate,
}: GalleryBlockSettingsProps) {
  const blockProps = block.props as {
    heading?: {
      text: string;
      align?: 'left' | 'center' | 'right';
    };
    imageUrls?: string[];
  };

  const [imageUrls, setImageUrls] = useState<string[]>(blockProps.imageUrls || []);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Check total count
    if (imageUrls.length + files.length > 12) {
      alert('Максимум 12 изображений');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const supabase = createClient();
    const newUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Check file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          alert(`Файл ${file.name} слишком большой (макс. 50MB)`);
          continue;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
          alert(`Файл ${file.name} не является изображением`);
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `proposal-media/${fileName}`;

        // Upload to Supabase Storage
        const { data, error } = await supabase.storage
          .from('proposal-media')
          .upload(filePath, file);

        if (error) {
          console.error('Upload error:', error);
          alert(`Ошибка загрузки ${file.name}: ${error.message}`);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('proposal-media')
          .getPublicUrl(filePath);

        newUrls.push(publicUrl);
        setUploadProgress(Math.round(((i + 1) / files.length) * 100));
      }

      // Update state and save
      const updatedUrls = [...imageUrls, ...newUrls];
      setImageUrls(updatedUrls);
      await onUpdate(block.id, { imageUrls: updatedUrls });
    } catch (error) {
      console.error('Upload error:', error);
      alert('Ошибка загрузки изображений');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset input
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (index: number) => {
    const updatedUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(updatedUrls);
    await onUpdate(block.id, { imageUrls: updatedUrls });
  };

  return (
    <div className="space-y-6">
      {/* Heading settings */}
      <div className="space-y-3">
        <Label className="font-semibold">Заголовок</Label>
        <HeadingSettings
          heading={blockProps.heading}
          onChange={(heading) => {
            const newUrls = imageUrls;
            onUpdate(block.id, { heading, imageUrls: newUrls });
          }}
        />
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold">Галерея изображений</h3>

        {/* Upload button */}
        <div className="space-y-2">
          <Label>Изображения ({imageUrls.length}/12)</Label>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isUploading || imageUrls.length >= 12}
              onClick={() => document.getElementById('gallery-upload')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isUploading ? `Загрузка ${uploadProgress}%` : 'Загрузить изображения'}
            </Button>
            <input
              id="gallery-upload"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              disabled={isUploading || imageUrls.length >= 12}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Максимум 12 изображений, до 50MB каждое
          </p>
        </div>

        {/* Image list */}
        {imageUrls.length > 0 && (
          <div className="space-y-2">
            <Label>Загруженные изображения</Label>
            <div className="grid grid-cols-2 gap-2">
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-video rounded-md overflow-hidden border group"
                >
                  <Image
                    src={url}
                    alt={`Image ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
