-- Fix workspace_members visibility using SECURITY DEFINER function

-- Helper function to get user's workspace IDs (bypasses RLS)
CREATE OR REPLACE FUNCTION get_user_workspace_ids(user_id_param UUID)
RETURNS TABLE(workspace_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT wm.workspace_id
  FROM workspace_members wm
  WHERE wm.user_id = user_id_param;
END;
$$;

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view their own workspace memberships" ON workspace_members;
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;

-- Users can see all members in workspaces where they are also members
CREATE POLICY "Users can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM get_user_workspace_ids(auth.uid())
    )
  );
