'use client';

import { useState, useEffect } from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { switchWorkspace } from '@/app/actions/workspace';
import type { Workspace } from '@/types/database';

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  currentWorkspaceId?: string;
  onWorkspaceChange?: (workspaceId: string) => void;
}

export function WorkspaceSelector({ 
  workspaces, 
  currentWorkspaceId,
  onWorkspaceChange 
}: WorkspaceSelectorProps) {
  const [selectedWorkspace, setSelectedWorkspace] = useState(currentWorkspaceId || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentWorkspaceId) {
      setSelectedWorkspace(currentWorkspaceId);
    }
  }, [currentWorkspaceId]);

  const handleWorkspaceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const workspaceId = e.target.value;
    setSelectedWorkspace(workspaceId);
    setError(null);
    setIsLoading(true);

    try {
      const result = await switchWorkspace(workspaceId);
      
      if (!result.success) {
        setError(result.error.message);
        setSelectedWorkspace(currentWorkspaceId || '');
        return;
      }

      if (onWorkspaceChange) {
        onWorkspaceChange(workspaceId);
      }
    } catch (err) {
      setError('Failed to switch workspace');
      setSelectedWorkspace(currentWorkspaceId || '');
    } finally {
      setIsLoading(false);
    }
  };

  if (workspaces.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        No workspaces available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Select
        value={selectedWorkspace}
        onChange={handleWorkspaceChange}
        disabled={isLoading}
        className="w-full"
      >
        <option value="" disabled>Select a workspace</option>
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
          </option>
        ))}
      </Select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
}
