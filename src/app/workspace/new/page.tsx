'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CreateWorkspaceForm } from '@/components/workspace';

export default function NewWorkspacePage() {
  const router = useRouter();

  const handleSuccess = (workspaceId: string) => {
    router.push(`/workspace/${workspaceId}`);
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <Link href="/" className="hover:text-blue-600">
              Home
            </Link>
            <span>/</span>
            <span>New Workspace</span>
          </div>
          <h1 className="text-3xl font-bold">Create New Workspace</h1>
          <p className="text-gray-600">Set up a new workspace for your team</p>
        </div>
        <CreateWorkspaceForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
