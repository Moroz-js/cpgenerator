-- Allow workspace owners to look up profiles by email when inviting members
-- This is needed for the invite flow to check if a user already exists

CREATE POLICY "Workspace owners can lookup profiles by email for invites"
  ON profiles FOR SELECT
  USING (
    -- User can see their own profile
    auth.uid() = id
    OR
    -- User is a workspace owner (can invite members)
    EXISTS (
      SELECT 1 FROM workspaces
      WHERE owner_id = auth.uid()
    )
  );

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
