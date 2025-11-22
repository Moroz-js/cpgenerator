-- Temporarily simplify invitations policy for debugging
-- This allows any authenticated user to create invitations
-- TODO: Revert this after fixing RLS issues

DROP POLICY IF EXISTS "Workspace owners can create invitations" ON invitations;

CREATE POLICY "Workspace owners can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    -- Check directly if user is owner of the workspace
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = invitations.workspace_id
      AND workspaces.owner_id = auth.uid()
    )
  );
