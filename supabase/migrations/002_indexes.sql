-- Create indexes for better query performance

-- Workspace Members indexes
CREATE INDEX idx_workspace_members_workspace ON workspace_members(workspace_id);
CREATE INDEX idx_workspace_members_user ON workspace_members(user_id);

-- Cases indexes
CREATE INDEX idx_cases_workspace ON cases(workspace_id);

-- Proposals indexes
CREATE INDEX idx_proposals_workspace ON proposals(workspace_id);
CREATE INDEX idx_proposals_status ON proposals(status);

-- Public Links indexes
CREATE INDEX idx_public_links_slug ON public_links(slug);
CREATE INDEX idx_public_links_active ON public_links(is_active) WHERE is_active = TRUE;

-- Templates indexes
CREATE INDEX idx_templates_workspace ON templates(workspace_id);

-- Comments indexes
CREATE INDEX idx_comments_section ON comments(section_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
CREATE INDEX idx_comments_resolved ON comments(is_resolved) WHERE is_resolved = FALSE;

-- Presence indexes
CREATE INDEX idx_presence_proposal ON presence(proposal_id);
CREATE INDEX idx_presence_user ON presence(user_id);
