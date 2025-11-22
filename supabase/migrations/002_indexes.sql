-- ============================================================================
-- PERFORMANCE INDEXES
-- ============================================================================
-- Indexes to optimize RLS policy checks and common queries
-- ============================================================================

-- Profiles indexes
CREATE INDEX idx_profiles_email ON profiles(email);

-- Workspaces indexes
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);

-- Workspace Members indexes (composite for RLS checks)
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);
CREATE INDEX idx_workspace_members_workspace_user ON workspace_members(workspace_id, user_id);

-- Invitations indexes
CREATE INDEX idx_invitations_workspace ON invitations(workspace_id);
CREATE INDEX idx_invitations_email ON invitations(email);
CREATE INDEX idx_invitations_token ON invitations(token);

-- Cases indexes
CREATE INDEX idx_cases_workspace ON cases(workspace_id);
CREATE INDEX idx_cases_created_by ON cases(created_by);

-- Proposals indexes
CREATE INDEX idx_proposals_workspace ON proposals(workspace_id);
CREATE INDEX idx_proposals_status ON proposals(status);
CREATE INDEX idx_proposals_created_by ON proposals(created_by);

-- Proposal Sections indexes
CREATE INDEX idx_proposal_sections_proposal ON proposal_sections(proposal_id);

-- Preview Attachments indexes
CREATE INDEX idx_preview_attachments_section ON preview_attachments(section_id);

-- Public Links indexes
CREATE INDEX idx_public_links_slug ON public_links(slug);
CREATE INDEX idx_public_links_proposal ON public_links(proposal_id);
CREATE INDEX idx_public_links_active ON public_links(is_active) WHERE is_active = TRUE;

-- Templates indexes
CREATE INDEX idx_templates_workspace ON templates(workspace_id);

-- Template Sections indexes
CREATE INDEX idx_template_sections_template ON template_sections(template_id);

-- Comments indexes
CREATE INDEX idx_comments_section ON comments(section_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_author ON comments(author_id);
CREATE INDEX idx_comments_resolved ON comments(is_resolved) WHERE is_resolved = FALSE;

-- Presence indexes
CREATE INDEX idx_presence_proposal ON presence(proposal_id);
CREATE INDEX idx_presence_user ON presence(user_id);
CREATE INDEX idx_presence_last_seen ON presence(last_seen);
