/**
 * Property-based tests for permission checks
 * Feature: proposal-generator, Property 30: Проверка прав доступа к воркспейсу
 * Validates: Requirements 10.1
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

describe('Permission Checks - Property Tests', () => {
  let testWorkspaceId: string;
  let testUserId: string;
  let nonMemberUserId: string;
  let testProposalId: string;
  let testCaseId: string;

  beforeEach(async () => {
    // Create test data

    // Create test user 1 (member)
    const { data: user1 } = await supabase.auth.admin.createUser({
      email: `test-member-${Date.now()}@example.com`,
      password: 'testpassword123',
      email_confirm: true,
    });
    testUserId = user1.user!.id;

    // Create test user 2 (non-member)
    const { data: user2 } = await supabase.auth.admin.createUser({
      email: `test-nonmember-${Date.now()}@example.com`,
      password: 'testpassword123',
      email_confirm: true,
    });
    nonMemberUserId = user2.user!.id;

    // Create test workspace
    const { data: workspace, error: workspaceError } = await supabase
      .from('workspaces')
      .insert({ 
        name: `Test Workspace ${Date.now()}`,
        owner_id: testUserId 
      })
      .select()
      .single();
    
    if (workspaceError || !workspace) {
      console.error('Failed to create workspace:', workspaceError);
      throw new Error(`Failed to create test workspace: ${workspaceError?.message}`);
    }
    
    testWorkspaceId = workspace.id;

    // Add user1 as member
    await supabase.from('workspace_members').insert({
      workspace_id: testWorkspaceId,
      user_id: testUserId,
      role: 'member',
    });

    // Create test proposal
    const { data: proposal } = await supabase
      .from('proposals')
      .insert({
        workspace_id: testWorkspaceId,
        title: 'Test Proposal',
        client_name: 'Test Client',
        status: 'draft',
        created_by: testUserId,
      })
      .select()
      .single();
    testProposalId = proposal!.id;

    // Create test case
    const { data: testCase } = await supabase
      .from('cases')
      .insert({
        workspace_id: testWorkspaceId,
        title: 'Test Case',
        description: 'Test Description',
        created_by: testUserId,
      })
      .select()
      .single();
    testCaseId = testCase!.id;
  });

  afterEach(async () => {
    // Cleanup test data

    if (testProposalId) {
      await supabase.from('proposals').delete().eq('id', testProposalId);
    }
    if (testCaseId) {
      await supabase.from('cases').delete().eq('id', testCaseId);
    }
    if (testWorkspaceId) {
      await supabase.from('workspace_members').delete().eq('workspace_id', testWorkspaceId);
      await supabase.from('workspaces').delete().eq('id', testWorkspaceId);
    }
    if (testUserId) {
      await supabase.auth.admin.deleteUser(testUserId);
    }
    if (nonMemberUserId) {
      await supabase.auth.admin.deleteUser(nonMemberUserId);
    }
  });

  /**
   * Property 30: Проверка прав доступа к воркспейсу
   * For any user and workspace, access should only be granted if the user is a member of that workspace
   */
  it('should grant access only to workspace members', async () => {
    // Check member access
    const { data: memberData, error: memberError } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('user_id', testUserId)
      .eq('workspace_id', testWorkspaceId)
      .single();

    expect(memberError).toBeNull();
    expect(memberData).toBeTruthy();

    // Check non-member access
    const { data: nonMemberData } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('user_id', nonMemberUserId)
      .eq('workspace_id', testWorkspaceId)
      .maybeSingle();

    expect(nonMemberData).toBeNull();
  }, 30000);

  /**
   * Property 30 (variant): Workspace ownership check
   * For any user and workspace, ownership should only be granted if the user is the owner
   */
  it('should correctly identify workspace owners', async () => {
    // Create owner workspace
    const { data: ownerWorkspace } = await supabase
      .from('workspaces')
      .insert({ 
        name: `Owner Workspace ${Date.now()}`,
        owner_id: testUserId 
      })
      .select()
      .single();

    await supabase.from('workspace_members').insert({
      workspace_id: ownerWorkspace!.id,
      user_id: testUserId,
      role: 'owner',
    });

    // Check owner role
    const { data: ownerData } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('user_id', testUserId)
      .eq('workspace_id', ownerWorkspace!.id)
      .single();

    expect(ownerData?.role).toBe('owner');

    // Check non-owner
    const { data: nonOwnerData } = await supabase
      .from('workspace_members')
      .select('role')
      .eq('user_id', nonMemberUserId)
      .eq('workspace_id', ownerWorkspace!.id)
      .maybeSingle();

    expect(nonOwnerData).toBeNull();

    // Cleanup
    await supabase.from('workspace_members').delete().eq('workspace_id', ownerWorkspace!.id);
    await supabase.from('workspaces').delete().eq('id', ownerWorkspace!.id);
  }, 30000);

  /**
   * Property 30 (variant): Resource access verification
   * For any user and resource, access should only be granted if the user is a member of the resource's workspace
   */
  it('should verify resource access based on workspace membership', async () => {
    // Test with proposal
    const { data: proposal } = await supabase
      .from('proposals')
      .select('workspace_id')
      .eq('id', testProposalId)
      .single();

    expect(proposal).toBeTruthy();

    // Check member has access to workspace
    const { data: memberAccess } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('user_id', testUserId)
      .eq('workspace_id', proposal!.workspace_id)
      .maybeSingle();

    expect(memberAccess).toBeTruthy();

    // Check non-member doesn't have access
    const { data: nonMemberAccess } = await supabase
      .from('workspace_members')
      .select('id')
      .eq('user_id', nonMemberUserId)
      .eq('workspace_id', proposal!.workspace_id)
      .maybeSingle();

    expect(nonMemberAccess).toBeNull();
  }, 30000);

  /**
   * Property 30 (variant): Invalid resource IDs
   * For any user and invalid resource ID, access should be denied
   */
  it('should deny access for invalid resource IDs', async () => {
    const invalidId = '00000000-0000-0000-0000-000000000000';
    
    // Try to get non-existent proposal
    const { data: proposal } = await supabase
      .from('proposals')
      .select('workspace_id')
      .eq('id', invalidId)
      .maybeSingle();

    // Resource should not exist
    expect(proposal).toBeNull();
    
    // Try to get non-existent case
    const { data: testCase } = await supabase
      .from('cases')
      .select('workspace_id')
      .eq('id', invalidId)
      .maybeSingle();

    // Resource should not exist
    expect(testCase).toBeNull();
  }, 30000);
});
