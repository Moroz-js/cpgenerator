# Builder Migrations Documentation

This document describes the database migrations added for the Proposal Builder functionality.

## Overview

Two new migration files have been created:
- `009_builder_tables.sql` - Database tables for builder functionality
- `010_builder_storage.sql` - Storage bucket for gallery images

## Migration 009: Builder Tables

### Tables Created

#### 1. workspace_brand_settings
Stores branding and styling settings for each workspace.

**Features:**
- One-to-one relationship with workspaces (UNIQUE constraint)
- Logo URL storage
- Customizable color scheme (primary, secondary, background, text)
- Typography settings (font families)
- Component styling (border radius, shadows)
- SEO metadata (title, description, OG image)
- Automatic `updated_at` trigger

**Default Values:**
- Colors: Blue primary (#3B82F6), Purple secondary (#8B5CF6)
- Typography: Inter font family
- Components: Medium radius and shadows

#### 2. proposal_blocks
Stores individual content blocks that make up a proposal.

**Features:**
- Flexible block types (hero, cases, timeline, team estimate, payment, FAQ, contacts, text, gallery)
- Order management via `order_index`
- JSONB props for block-specific configuration
- Optional style overrides
- Efficient composite index on (proposal_id, order_index)
- Automatic `updated_at` trigger

**Supported Block Types:**
- `hero_simple` - Hero section with title, subtitle, CTA
- `cases_grid` - Grid/slider/row layout of case studies
- `timeline` - Linear/vertical/phases timeline visualization
- `team_estimate` - Team cost breakdown table
- `payment` - Payment schedule table
- `faq` - FAQ section (accordion/list layout)
- `contacts` - Contact information cards
- `text` - Rich text content with Tiptap
- `gallery` - Responsive image gallery (1-12 images)

#### 3. proposal_snapshots
Stores immutable snapshots of proposals at publish time.

**Features:**
- Captures complete proposal state including:
  - Brand settings at publish time
  - All blocks with resolved data (cases, FAQ items)
  - Metadata (version, publish timestamp, publisher)
- Links to public_links for public viewing
- Enables consistent viewing even if source data changes
- Supports PDF generation from immutable data
- Multiple indexes for efficient queries

**Use Cases:**
- Publishing proposals with immutable content
- Generating PDFs from consistent data
- Viewing historical versions of proposals
- Public sharing without exposing live data changes

#### 4. proposals.loom_url
Added new column to existing proposals table.

**Features:**
- Stores URL to Loom video presentation
- Nullable (optional)
- Idempotent migration (checks if column exists)

### Row Level Security (RLS)

All tables have comprehensive RLS policies:

**workspace_brand_settings:**
- View/create/update/delete: Workspace members only

**proposal_blocks:**
- View/create/update/delete: Workspace members only (via proposal → workspace join)

**proposal_snapshots:**
- View/create/update/delete: Workspace members only
- Special policy: Anyone can view snapshots with active public links

### Indexes

Optimized indexes for common queries:
- `idx_workspace_brand_settings_workspace` - Workspace lookups
- `idx_proposal_blocks_proposal` - Block queries by proposal
- `idx_proposal_blocks_proposal_order` - Ordered block queries
- `idx_proposal_snapshots_proposal` - Snapshot queries by proposal
- `idx_proposal_snapshots_public_link` - Public link lookups
- `idx_proposal_snapshots_created` - Chronological queries

## Migration 010: Builder Storage

### Storage Bucket Created

#### proposal-media
Public storage bucket for gallery block images.

**Configuration:**
- **Public**: Yes (allows viewing in published proposals)
- **Purpose**: Store images for gallery blocks
- **Max Size**: 50MB per file (configurable)
- **Allowed Types**: Images (jpg, png, webp, gif)

**RLS Policies:**
- Anyone can view (public bucket)
- Authenticated users can upload/update/delete

**Use Cases:**
- Gallery block images in proposals
- Visual content in published proposals
- Client-facing media assets

## Running the Migrations

### Local Development (Supabase CLI)

```bash
# Apply migrations
supabase db reset

# Or apply specific migrations
supabase migration up
```

### Production (Supabase Dashboard)

1. Go to Database → Migrations
2. Upload `009_builder_tables.sql`
3. Upload `010_builder_storage.sql`
4. Review and apply

### Verification

After running migrations, verify:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('workspace_brand_settings', 'proposal_blocks', 'proposal_snapshots');

-- Check loom_url column
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'proposals' AND column_name = 'loom_url';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'proposal-media';

-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('workspace_brand_settings', 'proposal_blocks', 'proposal_snapshots');
```

## Rollback (if needed)

To rollback these migrations:

```sql
-- Drop tables (cascades to policies and triggers)
DROP TABLE IF EXISTS proposal_snapshots CASCADE;
DROP TABLE IF EXISTS proposal_blocks CASCADE;
DROP TABLE IF EXISTS workspace_brand_settings CASCADE;

-- Remove loom_url column
ALTER TABLE proposals DROP COLUMN IF EXISTS loom_url;

-- Remove storage bucket
DELETE FROM storage.buckets WHERE id = 'proposal-media';
```

## Next Steps

After applying these migrations:

1. Update TypeScript types in `src/types/database.ts`
2. Create Zod validation schemas in `src/lib/validations/`
3. Implement Server Actions for CRUD operations
4. Build UI components for the builder
5. Test RLS policies with different user roles

## Notes

- All migrations are idempotent (safe to re-run)
- RLS policies ensure workspace isolation
- Indexes optimize common query patterns
- Snapshots provide immutable publish history
- Storage bucket is public for easy client access
