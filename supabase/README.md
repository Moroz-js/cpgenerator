# Supabase Setup Guide

This directory contains SQL migrations for setting up the Supabase database schema for the Proposal Generator application.

## Quick Setup

1. **Create a new Supabase project**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Fill in project details (name, database password, region)
   - Wait for the project to be provisioned

2. **Run migrations**
   - Go to the SQL Editor in your Supabase dashboard
   - Copy and paste the contents of each migration file in order:
     1. `001_initial_schema.sql`
     2. `002_indexes.sql`
     3. `003_rls_policies.sql`
     4. `004_storage_setup.sql`
     5. `005_functions_and_triggers.sql`
   - Execute each migration

3. **Configure environment variables**
   - Copy your project URL and anon key from Settings > API
   - Add them to your `.env.local` file:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```

## Database Schema Overview

### Core Tables

- **profiles** - User profile information
- **workspaces** - Team workspaces
- **workspace_members** - Workspace membership
- **invitations** - Workspace invitations
- **cases** - Case studies library
- **proposals** - Commercial proposals
- **proposal_sections** - Rich text sections of proposals
- **preview_attachments** - Preview content attached to text
- **public_links** - Public sharing links for proposals
- **templates** - Proposal templates
- **template_sections** - Template sections
- **comments** - Comments on proposal sections
- **presence** - Real-time user presence tracking

### Storage Buckets

- **case-images** - Images for case studies (public)
- **proposal-attachments** - Proposal attachments (private)
- **preview-attachments** - Preview content attachments (private)
- **avatars** - User avatar images (public)

## Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Users can only access data from workspaces they're members of
- Workspace owners have additional permissions for management
- Public links allow anonymous access to specific proposals
- Storage buckets have appropriate access controls

## Automatic Features

### Triggers

- **updated_at timestamps** - Automatically updated on record changes
- **Workspace owner membership** - Automatically created when workspace is created
- **User profile creation** - Automatically created on user signup

## Verification

After running migrations, verify in the Supabase dashboard:
- **Table Editor**: 13 tables should exist
- **Storage**: 4 buckets should be created
- **Authentication**: Email provider should be enabled

## Troubleshooting

**Migration errors**: Run migrations in order (001 → 005)  
**Permission errors**: Verify RLS policies are applied  
**Connection issues**: Check environment variables are correct

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
