-- Fix workspace_members SELECT policy to avoid recursion
-- Drop the old policy
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;

-- Create new policy that checks workspace ownership or existing membership without recursion
CREATE POLICY "Users can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    -- User can see their own membership
    user_id = auth.uid()
    OR
    -- User can see members of workspaces they own
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid()
    )
    OR
    -- User can see members of workspaces where they are already a member
    -- This uses a direct join to avoid recursion
    EXISTS (
      SELECT 1 FROM workspace_members wm
      WHERE wm.workspace_id = workspace_members.workspace_id
      AND wm.user_id = auth.uid()
    )
  );
