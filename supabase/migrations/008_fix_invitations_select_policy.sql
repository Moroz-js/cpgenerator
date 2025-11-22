-- Fix invitations SELECT policy to avoid accessing auth.users table
DROP POLICY IF EXISTS "Users can view invitations for their workspaces" ON invitations;

CREATE POLICY "Users can view invitations for their workspaces"
  ON invitations FOR SELECT
  USING (
    -- User can see invitations for workspaces they own
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid()
    )
    OR 
    -- User can see invitations sent to their email
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );
