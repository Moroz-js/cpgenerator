'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichTextEditor } from '@/components/editor';
import { createCase, updateCase } from '@/app/actions/cases';
import { createCaseSchema, updateCaseSchema } from '@/lib/validations/case';
import type { Case, CaseLink } from '@/types/database';

interface CaseEditorProps {
  workspaceId: string;
  case?: Case;
  onSuccess?: (caseId: string) => void;
  onCancel?: () => void;
}

export function CaseEditor({ workspaceId, case: existingCase, onSuccess, onCancel }: CaseEditorProps) {
  const [title, setTitle] = useState(existingCase?.title || '');
  const [description, setDescription] = useState(existingCase?.description || '');
  const [technologies, setTechnologies] = useState(existingCase?.technologies.join(', ') || '');
  const [results, setResults] = useState(existingCase?.results || '');
  const [links, setLinks] = useState<CaseLink[]>(existingCase?.links || []);
  const [images, setImages] = useState<string[]>(existingCase?.images || []);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const techArray = technologies
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const data = {
      workspaceId,
      title,
      description: description || undefined,
      technologies: techArray,
      results: results || undefined,
      images: images,
      links,
    };

    // Validate
    const schema = existingCase ? updateCaseSchema : createCaseSchema;
    const validation = schema.safeParse(
      existingCase ? { ...data, id: existingCase.id } : data
    );

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = existingCase
        ? await updateCase(existingCase.id, data)
        : await createCase(data);

      if (!result.success) {
        setErrors({ general: result.error.message });
        return;
      }

      if (onSuccess) {
        onSuccess(result.data.id);
      }
    } catch (err) {
      setErrors({ general: 'Failed to save case' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, image: 'Please select an image file' });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrors({ ...errors, image: 'File size must be less than 10MB' });
      return;
    }

    setIsUploading(true);
    setErrors({ ...errors, image: '' });

    try {
      const supabase = createClient();
      
      // Create a temporary case ID if this is a new case
      const caseId = existingCase?.id || `temp-${Date.now()}`;
      
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${caseId}/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('case-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('case-images')
        .getPublicUrl(filePath);
      
      // Add to images array
      setImages([...images, publicUrl]);
    } catch (err) {
      console.error('Upload error:', err);
      setErrors({ ...errors, image: err instanceof Error ? err.message : 'Failed to upload image' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter case title"
          disabled={isLoading}
        />
        {errors.title && (
          <p className="text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <RichTextEditor
          content={description}
          onChange={setDescription}
          placeholder="Describe the project..."
          editable={!isLoading}
        />
        {errors.description && (
          <p className="text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="technologies">Technologies</Label>
        <Input
          id="technologies"
          type="text"
          value={technologies}
          onChange={(e) => setTechnologies(e.target.value)}
          placeholder="React, Node.js, PostgreSQL (comma-separated)"
          disabled={isLoading}
        />
        <p className="text-xs text-gray-500">Separate technologies with commas</p>
        {errors.technologies && (
          <p className="text-sm text-red-600">{errors.technologies}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="results">Results & Achievements</Label>
        <RichTextEditor
          content={results}
          onChange={setResults}
          placeholder="What were the outcomes and achievements?"
          editable={!isLoading}
        />
        {errors.results && (
          <p className="text-sm text-red-600">{errors.results}</p>
        )}
      </div>

      <div className="space-y-4 border-t pt-4">
        <div>
          <h3 className="font-medium mb-3">Cover Image</h3>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={isLoading || isUploading}
              className="hidden"
              id="cover-image"
            />
            <label htmlFor="cover-image" className="cursor-pointer">
              <div className="space-y-2">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600 hover:text-blue-500">Upload an image</span>
                  {' '}or drag and drop
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                {isUploading && (
                  <p className="text-sm text-blue-600">Uploading...</p>
                )}
              </div>
            </label>
          </div>
          {errors.image && (
            <p className="text-sm text-red-600">{errors.image}</p>
          )}
          {images.length > 0 && (
            <div className="mt-4">
              <Label>Uploaded Images</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                {images.map((url, index) => (
                  <div key={index} className="relative aspect-video bg-gray-100 rounded overflow-hidden group">
                    <img
                      src={url}
                      alt={`Case image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4 border-t pt-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium">Links & Resources</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setLinks([...links, { type: 'website', url: '', title: '' }]);
            }}
            disabled={isLoading}
          >
            Add Link
          </Button>
        </div>
        
        {links.length === 0 ? (
          <p className="text-sm text-gray-500">No links added yet</p>
        ) : (
          <div className="space-y-3">
            {links.map((link, index) => (
              <div key={index} className="flex gap-2 items-start p-3 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="Link title"
                    value={link.title}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[index] = { ...link, title: e.target.value };
                      setLinks(newLinks);
                    }}
                    disabled={isLoading}
                  />
                  <Input
                    placeholder="URL"
                    type="url"
                    value={link.url}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[index] = { ...link, url: e.target.value };
                      setLinks(newLinks);
                    }}
                    disabled={isLoading}
                  />
                  <select
                    value={link.type}
                    onChange={(e) => {
                      const newLinks = [...links];
                      newLinks[index] = { ...link, type: e.target.value as CaseLink['type'] };
                      setLinks(newLinks);
                    }}
                    disabled={isLoading}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="website">Website</option>
                    <option value="github">GitHub</option>
                    <option value="app_store">App Store</option>
                    <option value="google_play">Google Play</option>
                    <option value="demo">Demo</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const newLinks = links.filter((_, i) => i !== index);
                    setLinks(newLinks);
                  }}
                  disabled={isLoading}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {errors.general && (
        <p className="text-sm text-red-600">{errors.general}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : existingCase ? 'Update Case' : 'Create Case'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
