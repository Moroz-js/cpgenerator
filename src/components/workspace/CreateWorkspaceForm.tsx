'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createWorkspace } from '@/app/actions/workspace';
import { createWorkspaceSchema } from '@/lib/validations/workspace';

interface CreateWorkspaceFormProps {
  onSuccess?: (workspaceId: string) => void;
  onCancel?: () => void;
}

export function CreateWorkspaceForm({ onSuccess, onCancel }: CreateWorkspaceFormProps) {
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; general?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    // Validate input
    const validation = createWorkspaceSchema.safeParse({ name });
    if (!validation.success) {
      const fieldErrors: { name?: string } = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0] === 'name') {
          fieldErrors.name = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await createWorkspace(name);
      
      if (!result.success) {
        setErrors({ general: result.error.message });
        return;
      }

      setName('');
      if (onSuccess) {
        onSuccess(result.data.id);
      }
    } catch (err) {
      setErrors({ general: 'Failed to create workspace' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="workspace-name">Workspace Name</Label>
        <Input
          id="workspace-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter workspace name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      {errors.general && (
        <p className="text-sm text-red-600">{errors.general}</p>
      )}

      <div className="flex gap-2">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Workspace'}
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
