-- Add foreign key from workspace_members to profiles
-- This allows PostgREST to join workspace_members with profiles

-- First, ensure all user_ids in workspace_members exist in profiles
-- (they should, because of the trigger)

-- Add foreign key constraint
ALTER TABLE workspace_members
  ADD CONSTRAINT workspace_members_user_id_fkey_profiles
  FOREIGN KEY (user_id)
  REFERENCES profiles(id)
  ON DELETE CASCADE;

-- Note: We keep the existing FK to auth.users as well
-- This is fine - a column can have multiple FKs
