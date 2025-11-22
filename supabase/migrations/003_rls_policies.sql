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

-- Profiles policies
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Workspaces policies
CREATE POLICY "Users can view their workspaces"
  ON workspaces FOR SELECT
  USING (
    id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
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

-- Workspace Members policies (simplified to avoid recursion)
CREATE POLICY "Users can view workspace members"
  ON workspace_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR
    workspace_id IN (
      SELECT wm.workspace_id FROM workspace_members wm
      WHERE wm.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert workspace members"
  ON workspace_members FOR INSERT
  WITH CHECK (true); -- Allows trigger to create owner membership

CREATE POLICY "Workspace owners can remove members"
  ON workspace_members FOR DELETE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid()
    )
  );

-- Invitations policies
CREATE POLICY "Users can view invitations for their workspaces"
  ON invitations FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
    OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Workspace owners can create invitations"
  ON invitations FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Workspace owners can update invitations"
  ON invitations FOR UPDATE
  USING (
    workspace_id IN (
      SELECT id FROM workspaces
      WHERE owner_id = auth.uid()
    )
  );

-- Cases policies
CREATE POLICY "Users can view workspace cases"
  ON cases FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create cases in their workspaces"
  ON cases FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cases in their workspaces"
  ON cases FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cases in their workspaces"
  ON cases FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Proposals policies
CREATE POLICY "Users can view workspace proposals"
  ON proposals FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create proposals in their workspaces"
  ON proposals FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update proposals in their workspaces"
  ON proposals FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete proposals in their workspaces"
  ON proposals FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Proposal Sections policies
CREATE POLICY "Users can view proposal sections"
  ON proposal_sections FOR SELECT
  USING (
    proposal_id IN (
      SELECT id FROM proposals
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create proposal sections"
  ON proposal_sections FOR INSERT
  WITH CHECK (
    proposal_id IN (
      SELECT id FROM proposals
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update proposal sections"
  ON proposal_sections FOR UPDATE
  USING (
    proposal_id IN (
      SELECT id FROM proposals
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete proposal sections"
  ON proposal_sections FOR DELETE
  USING (
    proposal_id IN (
      SELECT id FROM proposals
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Preview Attachments policies
CREATE POLICY "Users can view preview attachments"
  ON preview_attachments FOR SELECT
  USING (
    section_id IN (
      SELECT id FROM proposal_sections
      WHERE proposal_id IN (
        SELECT id FROM proposals
        WHERE workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create preview attachments"
  ON preview_attachments FOR INSERT
  WITH CHECK (
    section_id IN (
      SELECT id FROM proposal_sections
      WHERE proposal_id IN (
        SELECT id FROM proposals
        WHERE workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update preview attachments"
  ON preview_attachments FOR UPDATE
  USING (
    section_id IN (
      SELECT id FROM proposal_sections
      WHERE proposal_id IN (
        SELECT id FROM proposals
        WHERE workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can delete preview attachments"
  ON preview_attachments FOR DELETE
  USING (
    section_id IN (
      SELECT id FROM proposal_sections
      WHERE proposal_id IN (
        SELECT id FROM proposals
        WHERE workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Public Links policies
CREATE POLICY "Anyone can view active public links"
  ON public_links FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Users can view all public links for their proposals"
  ON public_links FOR SELECT
  USING (
    proposal_id IN (
      SELECT id FROM proposals
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create public links for their proposals"
  ON public_links FOR INSERT
  WITH CHECK (
    proposal_id IN (
      SELECT id FROM proposals
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update public links for their proposals"
  ON public_links FOR UPDATE
  USING (
    proposal_id IN (
      SELECT id FROM proposals
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete public links for their proposals"
  ON public_links FOR DELETE
  USING (
    proposal_id IN (
      SELECT id FROM proposals
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Templates policies
CREATE POLICY "Users can view workspace templates"
  ON templates FOR SELECT
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create templates in their workspaces"
  ON templates FOR INSERT
  WITH CHECK (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update templates in their workspaces"
  ON templates FOR UPDATE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete templates in their workspaces"
  ON templates FOR DELETE
  USING (
    workspace_id IN (
      SELECT workspace_id FROM workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Template Sections policies
CREATE POLICY "Users can view template sections"
  ON template_sections FOR SELECT
  USING (
    template_id IN (
      SELECT id FROM templates
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create template sections"
  ON template_sections FOR INSERT
  WITH CHECK (
    template_id IN (
      SELECT id FROM templates
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update template sections"
  ON template_sections FOR UPDATE
  USING (
    template_id IN (
      SELECT id FROM templates
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete template sections"
  ON template_sections FOR DELETE
  USING (
    template_id IN (
      SELECT id FROM templates
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

-- Comments policies
CREATE POLICY "Users can view comments on their proposals"
  ON comments FOR SELECT
  USING (
    section_id IN (
      SELECT id FROM proposal_sections
      WHERE proposal_id IN (
        SELECT id FROM proposals
        WHERE workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create comments on their proposals"
  ON comments FOR INSERT
  WITH CHECK (
    section_id IN (
      SELECT id FROM proposal_sections
      WHERE proposal_id IN (
        SELECT id FROM proposals
        WHERE workspace_id IN (
          SELECT workspace_id FROM workspace_members
          WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = author_id);

-- Presence policies
CREATE POLICY "Users can view presence for their proposals"
  ON presence FOR SELECT
  USING (
    proposal_id IN (
      SELECT id FROM proposals
      WHERE workspace_id IN (
        SELECT workspace_id FROM workspace_members
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own presence"
  ON presence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own presence"
  ON presence FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own presence"
  ON presence FOR DELETE
  USING (auth.uid() = user_id);
