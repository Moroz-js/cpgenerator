'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { upsertWorkspaceBrandSettings } from '@/app/actions/brand';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import type { WorkspaceBrandSettings } from '@/types/database';
import { createClient } from '@/lib/supabase/client';

interface BrandSettingsFormProps {
  workspaceId: string;
  initialSettings: WorkspaceBrandSettings | null;
}

const DEFAULT_SETTINGS = {
  colors: {
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    background: '#FFFFFF',
    text: '#1F2937',
  },
  typography: {
    fontFamily: 'Inter' as const,
    headingFont: 'Inter' as const,
    bodyFont: 'Inter' as const,
  },
  components: {
    cardRadius: 'md' as const,
    shadowSize: 'md' as const,
  },
  seo: {
    title: '',
    description: '',
    ogImage: '',
  },
};

export function BrandSettingsForm({ workspaceId, initialSettings }: BrandSettingsFormProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [logoUrl, setLogoUrl] = useState(initialSettings?.logoUrl || '');
  const [colors, setColors] = useState(initialSettings?.colors || DEFAULT_SETTINGS.colors);
  const [typography, setTypography] = useState(initialSettings?.typography || DEFAULT_SETTINGS.typography);
  const [components, setComponents] = useState(initialSettings?.components || DEFAULT_SETTINGS.components);
  const [seo, setSeo] = useState(initialSettings?.seo || DEFAULT_SETTINGS.seo);

  // Broadcast changes to preview
  useEffect(() => {
    const channel = new BroadcastChannel('brand-settings');
    channel.postMessage({
      logoUrl,
      colors,
      typography,
      components,
      seo,
    });
    return () => channel.close();
  }, [logoUrl, colors, typography, components, seo]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('=== handleLogoUpload START ===');
    const file = e.target.files?.[0];
    if (!file) {
      console.log('No file selected');
      return;
    }

    console.log('File selected:', {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.log('Invalid file type:', file.type);
      setError('Please upload an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      console.log('File too large:', file.size);
      setError('Image size must be less than 2MB');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const supabase = createClient();
      const fileExt = file.name.split('.').pop();
      const fileName = `${workspaceId}-logo-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      console.log('Uploading to:', { bucket: 'proposal-media', filePath });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('proposal-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      console.log('Upload response:', { uploadData, uploadError });

      if (uploadError) {
        console.error('Upload error details:', JSON.stringify(uploadError, null, 2));
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('proposal-media')
        .getPublicUrl(filePath);

      console.log('Public URL:', publicUrl);
      setLogoUrl(publicUrl);
      console.log('Logo URL set successfully');
    } catch (err) {
      console.error('Logo upload error:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      setError(`Failed to upload logo: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsUploading(false);
      console.log('=== handleLogoUpload END ===');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await upsertWorkspaceBrandSettings(workspaceId, {
        logoUrl: logoUrl || undefined,
        colors,
        typography,
        components,
        seo,
      });

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      setSuccess(true);
      router.refresh();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save brand settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Logo Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Logo</CardTitle>
          <CardDescription>Upload your company logo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {logoUrl && (
            <div className="mb-4">
              <img 
                src={logoUrl} 
                alt="Logo preview" 
                className="h-16 object-contain"
              />
            </div>
          )}
          <div>
            <Label htmlFor="logo">Logo Image</Label>
            <Input
              id="logo"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={isUploading}
            />
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG or SVG. Max 2MB.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Colors</CardTitle>
          <CardDescription>Define your brand color palette</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary-color"
                  type="color"
                  value={colors.primary}
                  onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={colors.primary}
                  onChange={(e) => setColors({ ...colors, primary: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary-color"
                  type="color"
                  value={colors.secondary}
                  onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={colors.secondary}
                  onChange={(e) => setColors({ ...colors, secondary: e.target.value })}
                  placeholder="#8B5CF6"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="background-color">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="background-color"
                  type="color"
                  value={colors.background}
                  onChange={(e) => setColors({ ...colors, background: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={colors.background}
                  onChange={(e) => setColors({ ...colors, background: e.target.value })}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="text-color"
                  type="color"
                  value={colors.text}
                  onChange={(e) => setColors({ ...colors, text: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  type="text"
                  value={colors.text}
                  onChange={(e) => setColors({ ...colors, text: e.target.value })}
                  placeholder="#1F2937"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader>
          <CardTitle>Typography</CardTitle>
          <CardDescription>Choose fonts for your proposals</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="font-family">Primary Font</Label>
            <Select
              id="font-family"
              value={typography.fontFamily}
              onChange={(e) => setTypography({ ...typography, fontFamily: e.target.value as any })}
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Poppins">Poppins</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="heading-font">Heading Font</Label>
            <Select
              id="heading-font"
              value={typography.headingFont}
              onChange={(e) => setTypography({ ...typography, headingFont: e.target.value as any })}
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Poppins">Poppins</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="body-font">Body Font</Label>
            <Select
              id="body-font"
              value={typography.bodyFont}
              onChange={(e) => setTypography({ ...typography, bodyFont: e.target.value as any })}
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Open Sans">Open Sans</option>
              <option value="Lato">Lato</option>
              <option value="Montserrat">Montserrat</option>
              <option value="Poppins">Poppins</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Components */}
      <Card>
        <CardHeader>
          <CardTitle>Components</CardTitle>
          <CardDescription>Customize component styles</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="card-radius">Card Border Radius</Label>
            <Select
              id="card-radius"
              value={components.cardRadius}
              onChange={(e) => setComponents({ ...components, cardRadius: e.target.value as any })}
            >
              <option value="none">None</option>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="shadow-size">Shadow Size</Label>
            <Select
              id="shadow-size"
              value={components.shadowSize}
              onChange={(e) => setComponents({ ...components, shadowSize: e.target.value as any })}
            >
              <option value="none">None</option>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardHeader>
          <CardTitle>SEO Settings</CardTitle>
          <CardDescription>Optimize for search engines and social sharing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="seo-title">SEO Title</Label>
            <Input
              id="seo-title"
              type="text"
              value={seo.title}
              onChange={(e) => setSeo({ ...seo, title: e.target.value })}
              placeholder="Your Company Name - Commercial Proposals"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">
              {seo.title.length}/100 characters
            </p>
          </div>
          <div>
            <Label htmlFor="seo-description">SEO Description</Label>
            <Input
              id="seo-description"
              type="text"
              value={seo.description}
              onChange={(e) => setSeo({ ...seo, description: e.target.value })}
              placeholder="Professional commercial proposals for your business"
              maxLength={300}
            />
            <p className="text-xs text-gray-500 mt-1">
              {seo.description.length}/300 characters
            </p>
          </div>
          <div>
            <Label htmlFor="og-image">Open Graph Image URL</Label>
            <Input
              id="og-image"
              type="url"
              value={seo.ogImage}
              onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
              placeholder="https://example.com/og-image.jpg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Image shown when sharing on social media
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-600">Brand settings saved successfully!</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={isSaving || isUploading}>
          {isSaving ? 'Saving...' : 'Save Brand Settings'}
        </Button>
      </div>
    </form>
  );
}
