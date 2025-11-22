-- Final fix for RLS recursion between workspaces and workspace_members
-- Idea: workspaces RLS может смотреть в workspace_members,
--       но workspace_members RLS НЕ должен смотреть в workspaces.

-- Optional helper function to check workspace membership without relying on RLS policies
CREATE OR REPLACE FUNCTION is_workspace_member(workspace_id_param UUID, user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM workspace_members
    WHERE workspace_id = workspace_id_param
      AND user_id = user_id_param
  );
END;
$$;

-- ============================================================================
-- WORKSPACES POLICIES (safe: depend on workspace_members only)
-- ============================================================================

-- Дропаем старую политику, чтобы переопределить
DROP POLICY IF EXISTS "Users can view their workspaces" ON workspaces;

-- Пользователь видит воркспейсы, которыми владеет или в которых он участник
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    owner_id = auth.uid()
    OR is_workspace_member(id, auth.uid())
  );

-- Остальные политики для workspaces остаются такими же, как в основной миграции:
--  - "Users can create workspaces"
--  - "Workspace owners can update their workspaces"
--  - "Workspace owners can delete their workspaces"
-- (их здесь не трогаем, чтобы не дублировать)

-- ============================================================================
-- WORKSPACE MEMBERS POLICIES (no references to workspaces → no recursion)
-- ============================================================================

-- Сносим старые политики, которые могли ссылаться на workspaces
DROP POLICY IF EXISTS "Users can view workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Users can insert workspace members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can remove members" ON workspace_members;
DROP POLICY IF EXISTS "Workspace owners can remove mem" ON workspace_members;

-- 1. Пользователь видит только СВОИ membership-записи
CREATE POLICY "Users can view their own workspace memberships"
  ON workspace_members FOR SELECT
  USING (user_id = auth.uid());

-- 2. Вставка membership'ов:
--    допускаем вставку, потому что она делается через триггер/серверный код
--    (create_workspace_owner_membership, инвайты и т.п.)
CREATE POLICY "System can insert workspace members"
  ON workspace_members FOR INSERT
  WITH CHECK (true);

-- 3. Пользователь может удалить только своё участие в воркспейсе
CREATE POLICY "Users can remove their own membership"
  ON workspace_members FOR DELETE
  USING (user_id = auth.uid());
