-- Fix workspace_members visibility
-- Allow users to see all members in workspaces they belong to

DROP POLICY IF EXISTS "Users can view their own workspace memberships" ON workspace_members;
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;

-- Users can see all members in workspaces where they are also members
CREATE POLICY "Users can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    -- User can see their own membership
    user_id = auth.uid()
    OR
    -- User can see other members in workspaces where they are also a member
    workspace_id IN (
      SELECT workspace_id 
      FROM workspace_members 
      WHERE user_id = auth.uid()
    )
  );
