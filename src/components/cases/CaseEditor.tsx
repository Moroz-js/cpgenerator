'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [isLoading, setIsLoading] = useState(false);
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
      images: existingCase?.images || [],
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
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the project..."
          disabled={isLoading}
          className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        <Label htmlFor="results">Results</Label>
        <textarea
          id="results"
          value={results}
          onChange={(e) => setResults(e.target.value)}
          placeholder="What were the outcomes and achievements?"
          disabled={isLoading}
          className="flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        {errors.results && (
          <p className="text-sm text-red-600">{errors.results}</p>
        )}
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
