-- Migration: Builder Tables
-- Description: Add tables for proposal builder functionality
-- Date: 2024-11-22

-- ============================================================================
-- 1. Workspace Brand Settings Table
-- ============================================================================

CREATE TABLE workspace_brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE UNIQUE,
  
  -- Logo
  logo_url TEXT,
  
  -- Colors (JSONB for flexibility)
  colors JSONB DEFAULT '{
    "primary": "#3B82F6",
    "secondary": "#8B5CF6",
    "background": "#FFFFFF",
    "text": "#1F2937"
  }'::jsonb,
  
  -- Typography
  typography JSONB DEFAULT '{
    "fontFamily": "Inter",
    "headingFont": "Inter",
    "bodyFont": "Inter"
  }'::jsonb,
  
  -- Components styling
  components JSONB DEFAULT '{
    "cardRadius": "md",
    "shadowSize": "md"
  }'::jsonb,
  
  -- SEO settings
  seo JSONB DEFAULT '{
    "title": "",
    "description": "",
    "ogImage": ""
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for workspace lookups
CREATE INDEX idx_workspace_brand_settings_workspace ON workspace_brand_settings(workspace_id);

-- Trigger for updated_at
CREATE TRIGGER update_workspace_brand_settings_updated_at
  BEFORE UPDATE ON workspace_brand_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. Proposal Blocks Table
-- ============================================================================

CREATE TABLE proposal_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  
  -- Block type (hero_simple, cases_grid, timeline, etc.)
  type TEXT NOT NULL,
  
  -- Order in the proposal
  order_index INTEGER NOT NULL,
  
  -- Block-specific properties (JSONB for flexibility)
  props JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Style overrides (optional)
  style_overrides JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_proposal_blocks_proposal ON proposal_blocks(proposal_id);
CREATE INDEX idx_proposal_blocks_proposal_order ON proposal_blocks(proposal_id, order_index);

-- Trigger for updated_at
CREATE TRIGGER update_proposal_blocks_updated_at
  BEFORE UPDATE ON proposal_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 3. Proposal Snapshots Table
-- ============================================================================

CREATE TABLE proposal_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  public_link_id UUID REFERENCES public_links(id) ON DELETE SET NULL,
  
  -- Immutable snapshot of brand settings at publish time
  brand JSONB NOT NULL,
  
  -- Immutable snapshot of all blocks with resolved data
  blocks JSONB NOT NULL,
  
  -- Metadata about the snapshot
  meta JSONB DEFAULT '{
    "version": "1.0",
    "publishedAt": null,
    "publishedBy": null
  }'::jsonb,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient queries
CREATE INDEX idx_proposal_snapshots_proposal ON proposal_snapshots(proposal_id);
CREATE INDEX idx_proposal_snapshots_public_link ON proposal_snapshots(public_link_id);
CREATE INDEX idx_proposal_snapshots_created ON proposal_snapshots(created_at DESC);

-- ============================================================================
-- 4. Add loom_url to proposals table
-- ============================================================================

-- Check if column exists before adding (for idempotency)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'proposals' AND column_name = 'loom_url'
  ) THEN
    ALTER TABLE proposals ADD COLUMN loom_url TEXT;
  END IF;
END $$;

-- ============================================================================
-- 5. Row Level Security Policies
-- ============================================================================

-- Enable RLS on new tables
ALTER TABLE workspace_brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_snapshots ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for workspace_brand_settings
-- ============================================================================

-- Users can view brand settings for workspaces they're members of
CREATE POLICY "Users can view workspace brand settings"
  ON workspace_brand_settings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_brand_settings.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- Users can create brand settings for workspaces they're members of
CREATE POLICY "Users can create workspace brand settings"
  ON workspace_brand_settings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_brand_settings.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- Users can update brand settings for workspaces they're members of
CREATE POLICY "Users can update workspace brand settings"
  ON workspace_brand_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_brand_settings.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- Users can delete brand settings for workspaces they're members of
CREATE POLICY "Users can delete workspace brand settings"
  ON workspace_brand_settings FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM workspace_members
      WHERE workspace_members.workspace_id = workspace_brand_settings.workspace_id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS Policies for proposal_blocks
-- ============================================================================

-- Users can view blocks for proposals in their workspaces
CREATE POLICY "Users can view proposal blocks"
  ON proposal_blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN workspace_members ON workspace_members.workspace_id = proposals.workspace_id
      WHERE proposals.id = proposal_blocks.proposal_id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- Users can create blocks for proposals in their workspaces
CREATE POLICY "Users can create proposal blocks"
  ON proposal_blocks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN workspace_members ON workspace_members.workspace_id = proposals.workspace_id
      WHERE proposals.id = proposal_blocks.proposal_id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- Users can update blocks for proposals in their workspaces
CREATE POLICY "Users can update proposal blocks"
  ON proposal_blocks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN workspace_members ON workspace_members.workspace_id = proposals.workspace_id
      WHERE proposals.id = proposal_blocks.proposal_id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- Users can delete blocks for proposals in their workspaces
CREATE POLICY "Users can delete proposal blocks"
  ON proposal_blocks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN workspace_members ON workspace_members.workspace_id = proposals.workspace_id
      WHERE proposals.id = proposal_blocks.proposal_id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- ============================================================================
-- RLS Policies for proposal_snapshots
-- ============================================================================

-- Users can view snapshots for proposals in their workspaces
CREATE POLICY "Users can view proposal snapshots"
  ON proposal_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN workspace_members ON workspace_members.workspace_id = proposals.workspace_id
      WHERE proposals.id = proposal_snapshots.proposal_id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- Anyone can view snapshots with active public links (for public viewing)
CREATE POLICY "Anyone can view public snapshots"
  ON proposal_snapshots FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public_links
      WHERE public_links.id = proposal_snapshots.public_link_id
        AND public_links.is_active = TRUE
    )
  );

-- Users can create snapshots for proposals in their workspaces
CREATE POLICY "Users can create proposal snapshots"
  ON proposal_snapshots FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN workspace_members ON workspace_members.workspace_id = proposals.workspace_id
      WHERE proposals.id = proposal_snapshots.proposal_id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- Users can update snapshots for proposals in their workspaces
CREATE POLICY "Users can update proposal snapshots"
  ON proposal_snapshots FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN workspace_members ON workspace_members.workspace_id = proposals.workspace_id
      WHERE proposals.id = proposal_snapshots.proposal_id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- Users can delete snapshots for proposals in their workspaces
CREATE POLICY "Users can delete proposal snapshots"
  ON proposal_snapshots FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM proposals
      JOIN workspace_members ON workspace_members.workspace_id = proposals.workspace_id
      WHERE proposals.id = proposal_snapshots.proposal_id
        AND workspace_members.user_id = auth.uid()
    )
  );

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE workspace_brand_settings IS 'Stores branding settings for each workspace (logo, colors, typography, etc.)';
COMMENT ON TABLE proposal_blocks IS 'Stores individual blocks that make up a proposal (hero, cases, timeline, etc.)';
COMMENT ON TABLE proposal_snapshots IS 'Immutable snapshots of proposals at publish time with resolved data';
COMMENT ON COLUMN proposals.loom_url IS 'URL to Loom video presentation for the proposal';
