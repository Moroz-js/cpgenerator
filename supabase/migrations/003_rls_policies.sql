  -- ============================================================================
  -- ROW LEVEL SECURITY POLICIES
  -- ============================================================================
  -- This migration sets up all RLS policies for multi-tenant data isolation
  -- Uses EXISTS instead of IN for better performance and to avoid recursion
  -- ============================================================================

  -- Enable Row Level Security on all tables
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
  ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
  ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
  ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
  ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
  ALTER TABLE proposal_sections ENABLE ROW LEVEL SECURITY;
  ALTER TABLE preview_attachments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public_links ENABLE ROW LEVEL SECURITY;
  ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
  ALTER TABLE template_sections ENABLE ROW LEVEL SECURITY;
  ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE presence ENABLE ROW LEVEL SECURITY;

  -- ============================================================================
  -- PROFILES POLICIES
  -- ============================================================================

  CREATE POLICY "Users can view profiles"
    ON profiles FOR SELECT
    USING (
      -- User can see their own profile
      auth.uid() = id
      OR
      -- User is a workspace owner (can invite members and lookup profiles)
      EXISTS (
        SELECT 1 FROM workspaces
        WHERE owner_id = auth.uid()
      )
      OR
      -- User can see profiles of other workspace members
      EXISTS (
        SELECT 1 FROM workspace_members wm1
        WHERE wm1.user_id = profiles.id
        AND wm1.workspace_id IN (
          SELECT workspace_id FROM workspace_members wm2
          WHERE wm2.user_id = auth.uid()
        )
      )
    );

  CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

  CREATE POLICY "Users can insert their own profile"
    ON profiles FOR INSERT
    WITH CHECK (true); -- Allow trigger to create profiles

  -- ============================================================================
  -- WORKSPACES POLICIES
  -- ============================================================================

  CREATE POLICY "Users can view their workspaces"
    ON workspaces FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = workspaces.id
        AND workspace_members.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can create workspaces"
    ON workspaces FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

  CREATE POLICY "Workspace owners can update their workspaces"
    ON workspaces FOR UPDATE
    USING (auth.uid() = owner_id);

  CREATE POLICY "Workspace owners can delete their workspaces"
    ON workspaces FOR DELETE
    USING (auth.uid() = owner_id);

  -- ============================================================================
  -- WORKSPACE MEMBERS POLICIES
  -- ============================================================================

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

  -- ============================================================================
  -- INVITATIONS POLICIES
  -- ============================================================================

  CREATE POLICY "Users can view invitations"
    ON invitations FOR SELECT
    USING (
      -- User can see invitations for workspaces they own
      EXISTS (
        SELECT 1 FROM workspaces
        WHERE workspaces.id = invitations.workspace_id
        AND workspaces.owner_id = auth.uid()
      )
      OR
      -- User can see invitations sent to their email
      email = (SELECT email FROM profiles WHERE id = auth.uid())
    );

  CREATE POLICY "Workspace owners can create invitations"
    ON invitations FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM workspaces
        WHERE workspaces.id = invitations.workspace_id
        AND workspaces.owner_id = auth.uid()
      )
    );

  CREATE POLICY "Workspace owners can update invitations"
    ON invitations FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM workspaces
        WHERE workspaces.id = invitations.workspace_id
        AND workspaces.owner_id = auth.uid()
      )
    );

  -- ============================================================================
  -- CASES POLICIES
  -- ============================================================================

  CREATE POLICY "Users can view workspace cases"
    ON cases FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = cases.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can create cases in their workspaces"
    ON cases FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = cases.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can update cases in their workspaces"
    ON cases FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = cases.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can delete cases in their workspaces"
    ON cases FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = cases.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    );

  -- ============================================================================
  -- PROPOSALS POLICIES
  -- ============================================================================

  CREATE POLICY "Users can view workspace proposals"
    ON proposals FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = proposals.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can create proposals in their workspaces"
    ON proposals FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = proposals.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can update proposals in their workspaces"
    ON proposals FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = proposals.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can delete proposals in their workspaces"
    ON proposals FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = proposals.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    );

  -- ============================================================================
  -- PROPOSAL SECTIONS POLICIES
  -- ============================================================================

  CREATE POLICY "Users can view proposal sections"
    ON proposal_sections FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM proposals p
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE p.id = proposal_sections.proposal_id
        AND wm.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can create proposal sections"
    ON proposal_sections FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM proposals p
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE p.id = proposal_sections.proposal_id
        AND wm.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can update proposal sections"
    ON proposal_sections FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM proposals p
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE p.id = proposal_sections.proposal_id
        AND wm.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can delete proposal sections"
    ON proposal_sections FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM proposals p
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE p.id = proposal_sections.proposal_id
        AND wm.user_id = auth.uid()
      )
    );

  -- ============================================================================
  -- PREVIEW ATTACHMENTS POLICIES
  -- ============================================================================

  CREATE POLICY "Users can view preview attachments"
    ON preview_attachments FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM proposal_sections ps
        JOIN proposals p ON p.id = ps.proposal_id
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE ps.id = preview_attachments.section_id
        AND wm.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can create preview attachments"
    ON preview_attachments FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM proposal_sections ps
        JOIN proposals p ON p.id = ps.proposal_id
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE ps.id = preview_attachments.section_id
        AND wm.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can update preview attachments"
    ON preview_attachments FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM proposal_sections ps
        JOIN proposals p ON p.id = ps.proposal_id
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE ps.id = preview_attachments.section_id
        AND wm.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can delete preview attachments"
    ON preview_attachments FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM proposal_sections ps
        JOIN proposals p ON p.id = ps.proposal_id
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE ps.id = preview_attachments.section_id
        AND wm.user_id = auth.uid()
      )
    );

  -- ============================================================================
  -- PUBLIC LINKS POLICIES
  -- ============================================================================

  CREATE POLICY "Anyone can view active public links"
    ON public_links FOR SELECT
    USING (is_active = TRUE);

  CREATE POLICY "Users can manage public links for their proposals"
    ON public_links FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM proposals p
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE p.id = public_links.proposal_id
        AND wm.user_id = auth.uid()
      )
    );

  -- ============================================================================
  -- TEMPLATES POLICIES
  -- ============================================================================

  CREATE POLICY "Users can view workspace templates"
    ON templates FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = templates.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can create templates in their workspaces"
    ON templates FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = templates.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can update templates in their workspaces"
    ON templates FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = templates.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can delete templates in their workspaces"
    ON templates FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM workspace_members
        WHERE workspace_members.workspace_id = templates.workspace_id
        AND workspace_members.user_id = auth.uid()
      )
    );

  -- ============================================================================
  -- TEMPLATE SECTIONS POLICIES
  -- ============================================================================

  CREATE POLICY "Users can manage template sections"
    ON template_sections FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM templates t
        JOIN workspace_members wm ON wm.workspace_id = t.workspace_id
        WHERE t.id = template_sections.template_id
        AND wm.user_id = auth.uid()
      )
    );

  -- ============================================================================
  -- COMMENTS POLICIES
  -- ============================================================================

  CREATE POLICY "Users can view comments on their proposals"
    ON comments FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM proposal_sections ps
        JOIN proposals p ON p.id = ps.proposal_id
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE ps.id = comments.section_id
        AND wm.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can create comments on their proposals"
    ON comments FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM proposal_sections ps
        JOIN proposals p ON p.id = ps.proposal_id
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE ps.id = comments.section_id
        AND wm.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can update their own comments"
    ON comments FOR UPDATE
    USING (auth.uid() = author_id);

  CREATE POLICY "Users can delete their own comments"
    ON comments FOR DELETE
    USING (auth.uid() = author_id);

  -- ============================================================================
  -- PRESENCE POLICIES
  -- ============================================================================

  CREATE POLICY "Users can view presence for their proposals"
    ON presence FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM proposals p
        JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
        WHERE p.id = presence.proposal_id
        AND wm.user_id = auth.uid()
      )
    );

  CREATE POLICY "Users can manage their own presence"
    ON presence FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
