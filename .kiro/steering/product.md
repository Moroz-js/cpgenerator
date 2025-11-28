# Product Overview

CPGenerator is a commercial proposal builder and management platform for agencies and freelancers. It enables teams to create, customize, and share professional proposals with clients.

## Core Features

- **Workspace Management**: Multi-tenant architecture with role-based access (owner/member)
- **Case Library**: Store and showcase past projects with images, technologies, and results
- **Proposal Builder**: Block-based editor for creating customized proposals with drag-and-drop functionality
- **Brand Customization**: Per-workspace branding (colors, typography, logos) applied to proposals
- **Public Sharing**: Generate shareable links for clients to view proposals without authentication
- **FAQ Management**: Reusable FAQ items across proposals
- **Rich Text Editing**: Tiptap-based editor for content sections

## User Workflow

1. Create workspace and invite team members
2. Build case library with past projects
3. Configure workspace branding
4. Create proposals using blocks (hero, cases, timeline, team estimate, payment schedule)
5. Customize content and styling
6. Generate public link for client review
7. Track proposal status (draft, sent, accepted, rejected)

## Technical Architecture

- Multi-tenant SaaS with workspace isolation
- Real-time collaboration support (presence tracking)
- Immutable snapshots for published proposals
- Block-based content system for flexibility
