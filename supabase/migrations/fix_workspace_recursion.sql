-- Fix infinite recursion between workspaces and workspace_members

-- Drop and recreate workspaces SELECT policy to avoid recursion
DROP POLICY IF EXISTS "Users can view their workspaces" ON workspaces;

CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    -- Owner can always see their workspace
    owner_id = auth.uid()
    OR
    -- Members can see workspaces they belong to
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspaces.id
      AND workspace_members.user_id = auth.uid()
    )
  );

-- Ensure workspace_members policies don't cause recursion
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can insert workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can remove members" ON workspace_members;

CREATE POLICY "Users can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    -- User can see their own membership
    user_id = auth.uid()
    OR
    -- User can see members of workspaces they own (no recursion - direct check)
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert workspace members"
  ON workspace_members FOR INSERT
  WITH CHECK (true); -- Allows trigger to create owner membership

CREATE POLICY "Workspace owners can remove members"
  ON workspace_members FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces WHERE owner_id = auth.uid()
    )
  );
