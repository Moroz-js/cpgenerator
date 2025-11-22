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
- Users can view and update their own profile
- Users can insert their own profile on signup

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
- Users can view members of their workspaces
- Owners can add/remove members

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
- Users can view invitations for their workspaces
- Users can view invitations sent to their email
- Owners can create/update invitations

---

### cases

Stores case studies for the workspace.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| workspace_id | UUID | References workspaces(id) |
| title | TEXT | Case title |
| description | TEXT | Case description |
| technologies | JSONB | Array of technology names |
| results | TEXT | Project results/outcomes |
| images | JSONB | Array of image URLs |
| created_by | UUID | References auth.users(id) |
| created_at | TIMESTAMPTZ | Creation timestamp |
| updated_at | TIMESTAMPTZ | Last update timestamp |

**JSONB Structure:**
```json
{
  "technologies": ["Next.js", "React", "PostgreSQL"],
  "images": ["url1", "url2"]
}
```

**RLS Policies:**
- Users can view/create/update/delete cases in their workspaces

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
- Users can view/create/update/delete proposals in their workspaces

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
- workspace_members(workspace_id, user_id)
- cases(workspace_id)
- proposals(workspace_id, status)
- public_links(slug, is_active)
- templates(workspace_id)
- comments(section_id, parent_id, is_resolved)
- presence(proposal_id, user_id)

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

1. **Row Level Security (RLS)**: All tables have RLS enabled
2. **Workspace Isolation**: Data is isolated by workspace membership
3. **Owner Permissions**: Workspace owners have elevated permissions
4. **Public Access**: Only active public links allow anonymous access
5. **Storage Security**: Storage buckets have appropriate access controls
6. **JWT Authentication**: All authenticated requests use Supabase JWT tokens

---

## Migration Order

Migrations must be applied in this order:
1. `001_initial_schema.sql` - Create tables
2. `002_indexes.sql` - Create indexes
3. `003_rls_policies.sql` - Enable RLS and create policies
4. `004_storage_setup.sql` - Create storage buckets
5. `005_functions_and_triggers.sql` - Create functions and triggers

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
