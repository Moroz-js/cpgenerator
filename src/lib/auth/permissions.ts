'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * Check if a user is a member of a workspace
 */
export async function checkWorkspaceMembership(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  console.log('=== checkWorkspaceMembership START ===');
  console.log('Input:', { userId, workspaceId });

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workspace_members')
    .select('id')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .single();

  console.log('Database response:', { data, error });

  if (error) {
    console.error('Error checking workspace membership:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.log('=== checkWorkspaceMembership END (false) ===');
    return false;
  }

  const isMember = !!data;
  console.log('Is member:', isMember);
  console.log('=== checkWorkspaceMembership END ===');
  return isMember;
}

/**
 * Check if a user is the owner of a workspace
 */
export async function checkWorkspaceOwnership(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  console.log('=== checkWorkspaceOwnership START ===');
  console.log('Input:', { userId, workspaceId });

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('workspace_members')
    .select('role')
    .eq('user_id', userId)
    .eq('workspace_id', workspaceId)
    .single();

  console.log('Database response:', { data, error });

  if (error) {
    console.error('Error checking workspace ownership:', error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.log('=== checkWorkspaceOwnership END (false) ===');
    return false;
  }

  const isOwner = data?.role === 'owner';
  console.log('Is owner:', isOwner);
  console.log('=== checkWorkspaceOwnership END ===');
  return isOwner;
}

/**
 * Get the workspace ID for a resource (proposal, case, etc.)
 */
export async function getResourceWorkspaceId(
  resourceType: 'proposal' | 'case',
  resourceId: string
): Promise<string | null> {
  console.log('=== getResourceWorkspaceId START ===');
  console.log('Input:', { resourceType, resourceId });

  const supabase = await createClient();

  const tableName = resourceType === 'proposal' ? 'proposals' : 'cases';

  const { data, error } = await supabase
    .from(tableName)
    .select('workspace_id')
    .eq('id', resourceId)
    .single();

  console.log('Database response:', { data, error });

  if (error) {
    console.error(`Error getting ${resourceType} workspace:`, error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.log('=== getResourceWorkspaceId END (null) ===');
    return null;
  }

  console.log('Workspace ID:', data?.workspace_id);
  console.log('=== getResourceWorkspaceId END ===');
  return data?.workspace_id || null;
}

/**
 * Verify user has access to a resource
 */
export async function verifyResourceAccess(
  userId: string,
  resourceType: 'proposal' | 'case',
  resourceId: string
): Promise<boolean> {
  console.log('=== verifyResourceAccess START ===');
  console.log('Input:', { userId, resourceType, resourceId });

  const workspaceId = await getResourceWorkspaceId(resourceType, resourceId);

  if (!workspaceId) {
    console.log('Resource not found or no workspace');
    console.log('=== verifyResourceAccess END (false) ===');
    return false;
  }

  const hasAccess = await checkWorkspaceMembership(userId, workspaceId);
  console.log('Has access:', hasAccess);
  console.log('=== verifyResourceAccess END ===');
  return hasAccess;
}
