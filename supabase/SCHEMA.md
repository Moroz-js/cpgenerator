# Database Schema Documentation

This document provides detailed information about the database schema for the Proposal Generator application.

## Entity Relationship Overview

```
Users (auth.users)
  ↓
Profiles
  ↓
Workspaces ←→ Workspace Members
  ↓
  ├── Cases
  ├── Proposals
  │   ├── Proposal Sections
  │   │   ├── Preview Attachments
  │   │   └── Comments
  │   ├── Public Links
  │   └── Presence
  └── Templates
      └── Template Sections
```

## Tables

### profiles

Stores user profile information.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key, references auth.users(id) |
| email | TEXT | User email address |
| full_name | TEXT | User's full name |
| avatar_url | TEXT | URL to user's avatar image |
| created_at | TIMESTAMPTZ | Profile creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- One-to-one with auth.users
- One-to-many with workspaces (as owner)
- Many-to-many with workspaces (through workspace_members)

**RLS Policies:**
- Users can view their own profile
- Users can view profiles of workspace owners (for invitations)
- Users can view profiles of other workspace members
- Users can update their own profile
- Users can insert their own profile on signup

**Foreign Keys:**
- `user_id` → `profiles(id)` ON DELETE CASCADE

---

### workspaces

Represents team workspaces for organizing proposals and cases.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Workspace name |
| owner_id | UUID | References auth.users(id) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Relationships:**
- Belongs to one user (owner)
- Has many workspace_members
- Has many cases
- Has many proposals
- Has many templates

**RLS Policies:**
- Users can view workspaces they're members of
- Users can create workspaces (become owner)
- Owners can update/delete their workspaces

**Triggers:**
- Automatically creates owner membership on insert

---

### workspace_members

Junction table for workspace membership.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspace_id | UUID | References workspaces(id) |
| user_id | UUID | References auth.users(id) |
| role | TEXT | 'owner' or 'member' |
| joined_at | TIMESTAMPTZ | Membership creation timestamp |

**Constraints:**
- UNIQUE(workspace_id, user_id) - prevents duplicate memberships

**RLS Policies:**
- Users can view their own membership
- Users can view members of workspaces they own
- Users can view members of workspaces where they are members
- System can insert members (for owner creation trigger)
- Owners can remove members

**Foreign Keys:**
- `workspace_id` → `workspaces(id)` ON DELETE CASCADE
- `user_id` → `profiles(id)` ON DELETE CASCADE

---

### invitations

Stores workspace invitation tokens.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspace_id | UUID | References workspaces(id) |
| email | TEXT | Invited user's email |
| token | TEXT | Unique invitation token |
| invited_by | UUID | References auth.users(id) |
| status | TEXT | 'pending', 'accepted', or 'expired' |
| created_at | TIMESTAMPTZ | Creation timestamp |
| expires_at | TIMESTAMPTZ | Expiration timestamp |

**Constraints:**
- UNIQUE(token) - ensures token uniqueness

**RLS Policies:**
- Users can view invitations for workspaces they own
- Users can view invitations sent to their email (via profiles table)
- Workspace owners can create invitations
- Workspace owners can update invitations

**Note:** Uses `profiles` table for email lookup instead of `auth.users` to avoid RLS issues

---

### cases

Stores case studies for the workspace.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspace_id | UUID | References workspaces(id) |
| title | TEXT | Case title |
| description | TEXT | Case description (rich text JSON) |
| technologies | JSONB | Array of technology names |
| results | TEXT | Project results/outcomes (rich text JSON) |
| images | JSONB | Array of image URLs |
| links | JSONB | Array of link objects |
| created_by | UUID | References auth.users(id) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**JSONB Structures:**

Technologies:
```json
["Next.js", "React", "PostgreSQL", "Supabase"]
```

Images:
```json
["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
```

Links:
```json
[
  {
    "type": "website",
    "url": "https://example.com",
    "title": "Project Website"
  },
  {
    "type": "github",
    "url": "https://github.com/user/repo",
    "title": "Source Code"
  },
  {
    "type": "app_store",
    "url": "https://apps.apple.com/...",
    "title": "iOS App"
  }
]
```

**Link Types:**
- `website` - Project website
- `github` - GitHub repository
- `app_store` - Apple App Store
- `google_play` - Google Play Store
- `demo` - Live demo
- `other` - Other links

**RLS Policies:**
- Users can view cases in workspaces where they are members (uses EXISTS for performance)
- Users can create cases in workspaces where they are members
- Users can update cases in workspaces where they are members
- Users can delete cases in workspaces where they are members

**Note:** All policies use `EXISTS` instead of `IN` for better performance and to avoid recursion

---

### proposals

Stores commercial proposals.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspace_id | UUID | References workspaces(id) |
| title | TEXT | Proposal title |
| client_name | TEXT | Client name |
| status | TEXT | 'draft', 'sent', 'accepted', 'rejected' |
| timeline | JSONB | Project timeline |
| team_estimate | JSONB | Team cost estimates |
| selected_cases | JSONB | Array of case IDs |
| contacts | JSONB | Contact information |
| processes | TEXT | Rich text processes description |
| tech_stack | JSONB | Array of technologies |
| faq | JSONB | Array of FAQ items |
| payment_schedule | JSONB | Array of payment items |
| loom_videos | JSONB | Array of Loom video URLs |
| created_by | UUID | References auth.users(id) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |
| last_autosave | TIMESTAMPTZ | Last autosave timestamp |

**JSONB Structures:**

Timeline:
```json
{
  "start_date": "2024-01-01",
  "end_date": "2024-06-30",
  "milestones": [
    {
      "title": "Phase 1 Complete",
      "date": "2024-03-01",
      "description": "Initial development"
    }
  ]
}
```

Team Estimate:
```json
[
  {
    "role": "Senior Developer",
    "hours": 160,
    "rate": 100,
    "total": 16000
  }
]
```

**RLS Policies:**
- Users can view proposals in workspaces where they are members (uses EXISTS)
- Users can create proposals in workspaces where they are members
- Users can update proposals in workspaces where they are members
- Users can delete proposals in workspaces where they are members

**Note:** All policies use `EXISTS` with explicit joins for optimal performance

---

### proposal_sections

Stores rich text sections of proposals.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| proposal_id | UUID | References proposals(id) |
| section_type | TEXT | 'introduction', 'approach', 'custom' |
| content | JSONB | Rich text content (Tiptap JSON) |
| order_index | INTEGER | Section ordering |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete sections in their workspace proposals

---

### preview_attachments

Stores preview content attached to text.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| section_id | UUID | References proposal_sections(id) |
| text_reference | TEXT | Text that triggers preview |
| attachment_type | TEXT | 'image' or 'link' |
| attachment_url | TEXT | URL to preview content |
| created_at | TIMESTAMPTZ | Creation timestamp |

**RLS Policies:**
- Users can view/create/update/delete attachments in their workspace proposals

---

### public_links

Stores public sharing links for proposals.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| proposal_id | UUID | References proposals(id) |
| slug | TEXT | Unique URL slug |
| is_active | BOOLEAN | Link active status |
| created_by | UUID | References auth.users(id) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| deactivated_at | TIMESTAMPTZ | Deactivation timestamp |

**Constraints:**
- UNIQUE(slug) - ensures slug uniqueness

**RLS Policies:**
- Anyone can view active public links
- Users can view all links for their workspace proposals
- Users can create/update/delete links for their proposals

---

### templates

Stores proposal templates.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspace_id | UUID | References workspaces(id) |
| name | TEXT | Template name |
| description | TEXT | Template description |
| timeline | JSONB | Default timeline |
| team_estimate | JSONB | Default team estimate |
| contacts | JSONB | Default contacts |
| processes | TEXT | Default processes |
| tech_stack | JSONB | Default tech stack |
| faq | JSONB | Default FAQ |
| payment_schedule | JSONB | Default payment schedule |
| created_by | UUID | References auth.users(id) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**RLS Policies:**
- Users can view/create/update/delete templates in their workspaces

---

### template_sections

Stores template sections.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| template_id | UUID | References templates(id) |
| section_type | TEXT | Section type |
| content | JSONB | Rich text content |
| order_index | INTEGER | Section ordering |
| created_at | TIMESTAMPTZ | Creation timestamp |

**RLS Policies:**
- Users can view/create/update/delete sections in their workspace templates

---

### comments

Stores comments on proposal sections.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| section_id | UUID | References proposal_sections(id) |
| parent_id | UUID | References comments(id) for replies |
| author_id | UUID | References auth.users(id) |
| content | TEXT | Comment content |
| is_resolved | BOOLEAN | Resolution status |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**RLS Policies:**
- Users can view comments on their workspace proposals
- Users can create comments on their workspace proposals
- Users can update/delete their own comments

---

### presence

Tracks active users in proposals for real-time collaboration.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| proposal_id | UUID | References proposals(id) |
| user_id | UUID | References auth.users(id) |
| section_id | UUID | References proposal_sections(id) |
| last_seen | TIMESTAMPTZ | Last activity timestamp |

**Constraints:**
- UNIQUE(proposal_id, user_id) - one presence record per user per proposal

**RLS Policies:**
- Users can view presence for their workspace proposals
- Users can insert/update/delete their own presence

---

## Storage Buckets

### case-images
- **Public**: Yes
- **Purpose**: Store case study images
- **Max Size**: 50MB per file
- **Allowed Types**: Images (jpg, png, webp, gif)

### proposal-attachments
- **Public**: No
- **Purpose**: Store proposal attachments
- **Max Size**: 50MB per file
- **Access**: Workspace members only

### preview-attachments
- **Public**: No
- **Purpose**: Store preview content images
- **Max Size**: 50MB per file
- **Access**: Workspace members only

### avatars
- **Public**: Yes
- **Purpose**: Store user avatar images
- **Max Size**: 5MB per file
- **Allowed Types**: Images (jpg, png, webp)

---

## Indexes

Performance indexes are created on:

**Profiles:**
- `email` - For invitation lookups

**Workspaces:**
- `owner_id` - For owner checks

**Workspace Members:**
- `workspace_id` - For workspace queries
- `user_id` - For user queries
- `(workspace_id, user_id)` - Composite for RLS checks

**Invitations:**
- `workspace_id` - For workspace queries
- `email` - For email lookups
- `token` - For invitation acceptance

**Cases:**
- `workspace_id` - For workspace queries
- `created_by` - For user queries

**Proposals:**
- `workspace_id` - For workspace queries
- `status` - For status filtering
- `created_by` - For user queries

**Proposal Sections:**
- `proposal_id` - For proposal queries

**Preview Attachments:**
- `section_id` - For section queries

**Public Links:**
- `slug` - For URL lookups
- `proposal_id` - For proposal queries
- `is_active` (partial) - For active links only

**Templates:**
- `workspace_id` - For workspace queries

**Template Sections:**
- `template_id` - For template queries

**Comments:**
- `section_id` - For section queries
- `parent_id` - For threaded comments
- `author_id` - For user queries
- `is_resolved` (partial) - For unresolved comments only

**Presence:**
- `proposal_id` - For proposal queries
- `user_id` - For user queries
- `last_seen` - For cleanup queries and activity tracking

---

## Triggers and Functions

### update_updated_at_column()
Automatically updates the `updated_at` timestamp on record updates.

Applied to:
- profiles
- workspaces
- cases
- proposals
- proposal_sections
- templates
- comments

### create_workspace_owner_membership()
Automatically creates workspace membership for the owner when a workspace is created.

### create_user_profile()
Automatically creates a user profile when a new user signs up through Supabase Auth.

---

## Security Considerations

1. **Row Level Security (RLS)**: All tables have RLS enabled with comprehensive policies
2. **Workspace Isolation**: Data is strictly isolated by workspace membership
3. **Owner Permissions**: Workspace owners have elevated permissions for management
4. **Public Access**: Only active public links allow anonymous access to proposals
5. **Storage Security**: Storage buckets have appropriate access controls
6. **JWT Authentication**: All authenticated requests use Supabase JWT tokens
7. **Performance Optimization**: All RLS policies use `EXISTS` instead of `IN` for better performance
8. **Recursion Prevention**: Policies avoid self-referential checks that could cause infinite recursion
9. **Profile-Based Lookups**: Email lookups use `profiles` table instead of `auth.users` to avoid RLS conflicts
10. **Foreign Key Constraints**: Cascade deletes ensure referential integrity

---

## Migration Order

Migrations must be applied in this order:
1. `001_initial_schema.sql` - Create all tables with proper constraints
2. `002_indexes.sql` - Create performance indexes
3. `003_rls_policies.sql` - Enable RLS and create optimized policies
4. `004_storage_setup.sql` - Create storage buckets with access controls
5. `005_functions_and_triggers.sql` - Create functions and triggers

**Note:** All migrations are idempotent and can be safely re-run. The schema is production-ready with no additional fix migrations needed.

---

## Maintenance

### Backup Strategy
- Supabase provides automatic daily backups
- Point-in-time recovery available
- Export data regularly for additional safety

### Monitoring
- Monitor slow queries in Supabase dashboard
- Check RLS policy performance
- Monitor storage usage

### Optimization
- Regularly analyze query performance
- Add indexes as needed based on usage patterns
- Archive old proposals if needed

---

## Builder Tables (Added in Migration 009)

### workspace_brand_settings

Stores branding and styling settings for each workspace.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspace_id | UUID | References workspaces(id), UNIQUE |
| logo_url | TEXT | URL to workspace logo |
| colors | JSONB | Color scheme (primary, secondary, background, text) |
| typography | JSONB | Font settings (fontFamily, headingFont, bodyFont) |
| components | JSONB | Component styling (cardRadius, shadowSize) |
| seo | JSONB | SEO settings (title, description, ogImage) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Default Values:**

Colors:
```json
{
  "primary": "#3B82F6",
  "secondary": "#8B5CF6",
  "background": "#FFFFFF",
  "text": "#1F2937"
}
```

Typography:
```json
{
  "fontFamily": "Inter",
  "headingFont": "Inter",
  "bodyFont": "Inter"
}
```

Components:
```json
{
  "cardRadius": "md",
  "shadowSize": "md"
}
```

SEO:
```json
{
  "title": "",
  "description": "",
  "ogImage": ""
}
```

**Relationships:**
- Belongs to one workspace (one-to-one)

**RLS Policies:**
- Users can view/create/update/delete brand settings for workspaces they're members of

**Constraints:**
- UNIQUE(workspace_id) - one brand settings per workspace

**Triggers:**
- `update_workspace_brand_settings_updated_at` - Updates updated_at on changes

---

### proposal_blocks

Stores individual content blocks that make up a proposal in the builder.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| proposal_id | UUID | References proposals(id) |
| type | TEXT | Block type (hero_simple, cases_grid, timeline, etc.) |
| order_index | INTEGER | Position in proposal |
| props | JSONB | Block-specific properties |
| style_overrides | JSONB | Optional style customizations |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**Block Types:**
- `hero_simple` - Hero section with title, subtitle, CTA
- `cases_grid` - Grid of case studies
- `timeline` - Project timeline visualization
- `team_estimate` - Team cost breakdown table
- `payment` - Payment schedule table
- `faq` - FAQ section
- `contacts` - Contact information cards
- `text` - Rich text content (Tiptap)
- `gallery` - Image gallery

**Props Structure (varies by type):**

Hero Block:
```json
{
  "title": "Project Title",
  "subtitle": "Project Description",
  "clientName": "Client Name",
  "ctaLabel": "Get Started"
}
```

Cases Block:
```json
{
  "layout": "grid",
  "caseIds": ["uuid1", "uuid2"],
  "showTags": true,
  "showLinks": true
}
```

Timeline Block:
```json
{
  "variant": "linear",
  "items": [
    {
      "title": "Phase 1",
      "date": "2024-01-01",
      "description": "Description"
    }
  ]
}
```

**Relationships:**
- Belongs to one proposal
- Ordered by order_index

**RLS Policies:**
- Users can view/create/update/delete blocks for proposals in their workspaces

**Indexes:**
- `idx_proposal_blocks_proposal` - For proposal queries
- `idx_proposal_blocks_proposal_order` - For ordered queries

**Triggers:**
- `update_proposal_blocks_updated_at` - Updates updated_at on changes

---

### proposal_snapshots

Stores immutable snapshots of proposals at publish time with all resolved data.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| proposal_id | UUID | References proposals(id) |
| public_link_id | UUID | References public_links(id), nullable |
| brand | JSONB | Snapshot of brand settings |
| blocks | JSONB | Snapshot of all blocks with resolved data |
| meta | JSONB | Metadata (version, publishedAt, publishedBy) |
| created_at | TIMESTAMPTZ | Snapshot creation timestamp |

**Purpose:**
- Preserves proposal state at publish time
- Includes resolved data (cases, FAQ items) to avoid broken links
- Enables consistent viewing even if source data changes
- Supports PDF generation from immutable data

**Blocks Structure:**
```json
[
  {
    "id": "uuid",
    "type": "hero_simple",
    "order_index": 0,
    "props": { ... },
    "resolvedData": { ... }
  },
  {
    "id": "uuid",
    "type": "cases_grid",
    "order_index": 1,
    "props": { "caseIds": ["uuid1"] },
    "resolvedData": {
      "cases": [
        {
          "id": "uuid1",
          "title": "Case Title",
          "description": "...",
          "technologies": ["React", "Node.js"],
          "images": ["url1", "url2"]
        }
      ]
    }
  }
]
```

**Meta Structure:**
```json
{
  "version": "1.0",
  "publishedAt": "2024-11-22T10:00:00Z",
  "publishedBy": "user-uuid"
}
```

**Relationships:**
- Belongs to one proposal
- Optionally linked to one public_link

**RLS Policies:**
- Users can view snapshots for proposals in their workspaces
- Anyone can view snapshots with active public links (for public viewing)
- Users can create/update/delete snapshots for proposals in their workspaces

**Indexes:**
- `idx_proposal_snapshots_proposal` - For proposal queries
- `idx_proposal_snapshots_public_link` - For public link queries
- `idx_proposal_snapshots_created` - For chronological queries

---

## Storage Buckets (Updated)

### proposal-media (Added in Migration 010)
- **Public**: Yes
- **Purpose**: Store gallery block images for proposals
- **Max Size**: 50MB per file
- **Allowed Types**: Images (jpg, png, webp, gif)
- **Access**: Anyone can view, authenticated users can upload/update/delete

---

## Migration Order (Updated)

Migrations must be applied in this order:
1. `001_initial_schema.sql` - Create all tables with proper constraints
2. `002_indexes.sql` - Create performance indexes
3. `003_rls_policies.sql` - Enable RLS and create optimized policies
4. `004_storage_setup.sql` - Create storage buckets with access controls
5. `005_functions_and_triggers.sql` - Create functions and triggers
6. `006_add_profiles_fk.sql` - Add foreign key constraints
7. `007_storage_setup.sql` - Additional storage setup
8. `008_faq_items.sql` - FAQ items table
9. `009_builder_tables.sql` - **Builder tables (brand settings, blocks, snapshots)**
10. `010_builder_storage.sql` - **Builder storage bucket (proposal-media)**

**Note:** Migrations 009 and 010 add the proposal builder functionality including brand customization, block-based content, and immutable snapshots for publishing.
