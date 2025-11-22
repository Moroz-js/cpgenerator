-- Fix infinite recursion in workspace_members policies

-- Drop existing workspace_members policies
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can insert workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can remove members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can remove mem" ON workspace_members;

-- Recreate workspace_members policies without recursion
CREATE POLICY "Users can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    -- User can see their own membership
    user_id = auth.uid()
    OR
    -- User can see members of workspaces they own
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert workspace members"
  ON workspace_members FOR INSERT
  WITH CHECK (true); -- Allows trigger to create owner membership

CREATE POLICY "Workspace owners can remove members"
  ON workspace_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_members.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );
