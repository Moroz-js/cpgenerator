'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { inviteMember } from '@/app/actions/workspace';
import { inviteMemberSchema } from '@/lib/validations/workspace';

interface InviteMemberFormProps {
  workspaceId: string;
  onSuccess?: () => void;
}

export function InviteMemberForm({ workspaceId, onSuccess }: InviteMemberFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; general?: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSuccessMessage(null);
    setIsLoading(true);

    // Validate input
    const validation = inviteMemberSchema.safeParse({ workspaceId, email });
    if (!validation.success) {
      const fieldErrors: { email?: string } = {};
      validation.error.issues.forEach((err) => {
        if (err.path[0] === 'email') {
          fieldErrors.email = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const result = await inviteMember(workspaceId, email);
      
      if (!result.success) {
        setErrors({ general: result.error.message });
        return;
      }

      setEmail('');
      const message = result.data.status === 'accepted' 
        ? `${email} добавлен в workspace!` 
        : `Приглашение отправлено на ${email}`;
      setSuccessMessage(message);
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Refresh page after 1 second to show new member
      if (result.data.status === 'accepted') {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      setErrors({ general: 'Failed to send invitation' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="member-email">Email Address</Label>
        <Input
          id="member-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      {errors.general && (
        <p className="text-sm text-red-600">{errors.general}</p>
      )}

      {successMessage && (
        <p className="text-sm text-green-600">{successMessage}</p>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? 'Sending...' : 'Send Invitation'}
      </Button>
    </form>
  );
}
