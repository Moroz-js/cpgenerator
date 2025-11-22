'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface CaseImageUploaderProps {
  caseId: string;
  existingImages?: string[];
  onUploadComplete?: (imageUrl: string) => void;
}

export function CaseImageUploader({ caseId, existingImages = [], onUploadComplete }: CaseImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // TODO: Implement actual upload to Supabase Storage
      // For now, just simulate upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockUrl = `https://placeholder.com/${file.name}`;
      
      if (onUploadComplete) {
        onUploadComplete(mockUrl);
      }
    } catch (err) {
      setError('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="image-upload">Upload Image</Label>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>

      {existingImages.length > 0 && (
        <div className="space-y-2">
          <Label>Existing Images</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {existingImages.map((url, index) => (
              <div key={index} className="relative aspect-video bg-gray-100 rounded overflow-hidden">
                <img
                  src={url}
                  alt={`Case image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
