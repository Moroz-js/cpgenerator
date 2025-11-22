'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { removeMember } from '@/app/actions/workspace';
import type { WorkspaceMember } from '@/types/database';

interface MemberListProps {
  members: WorkspaceMember[];
  workspaceId: string;
  currentUserId: string;
  isOwner: boolean;
}

export function MemberList({ members, workspaceId, currentUserId, isOwner }: MemberListProps) {
  const handleRemoveMember = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) {
      return;
    }

    const result = await removeMember(workspaceId, userId);
    
    if (!result.success) {
      alert(`Failed to remove member: ${result.error.message}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
        <CardDescription>People who have access to this workspace</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.length === 0 ? (
            <p className="text-sm text-gray-500">No members yet</p>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {member.user?.email || 'Unknown'}
                    {member.userId === currentUserId && (
                      <span className="ml-2 text-xs text-gray-500">(You)</span>
                    )}
                  </p>
                  {member.user?.fullName && (
                    <p className="text-sm text-gray-500">{member.user.fullName}</p>
                  )}
                  <p className="text-xs text-gray-400">
                    {member.role === 'owner' ? 'Owner' : 'Member'} • Joined{' '}
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </p>
                </div>
                {isOwner && member.userId !== currentUserId && member.role !== 'owner' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveMember(member.userId)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
