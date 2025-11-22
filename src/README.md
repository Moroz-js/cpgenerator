# Project Structure

This document describes the folder structure and organization of the Proposal Generator application.

## Directory Structure

```
src/
├── app/                    # Next.js App Router pages and layouts
│   ├── actions/           # Server Actions for data mutations
│   ├── globals.css        # Global styles with Tailwind CSS v4
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/             # Authentication components (LoginForm, SignUpForm, etc.)
│   ├── cases/            # Case library components (CaseList, CaseEditor, etc.)
│   ├── collaboration/    # Real-time collaboration components
│   ├── comments/         # Comment system components
│   ├── proposals/        # Proposal editor and management components
│   ├── templates/        # Template management components
│   ├── ui/               # shadcn/ui components
│   └── workspace/        # Workspace management components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries and configurations
│   ├── realtime/        # Supabase Realtime utilities
│   ├── supabase/        # Supabase client configurations
│   │   ├── client.ts    # Browser client
│   │   └── server.ts    # Server client
│   ├── validations/     # Zod validation schemas
│   │   ├── auth.ts      # Authentication schemas
│   │   ├── case.ts      # Case schemas
│   │   ├── proposal.ts  # Proposal schemas
│   │   ├── workspace.ts # Workspace schemas
│   │   └── index.ts     # Export all schemas
│   └── utils.ts         # Utility functions
├── types/               # TypeScript type definitions
│   ├── database.ts      # Database models and types
│   └── index.ts         # Export all types
└── middleware.ts        # Next.js middleware for route protection

## Technology Stack

### Core Dependencies
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Supabase**: Backend (Auth, Database, Storage, Realtime)
- **Tailwind CSS v4**: Styling with @tailwindcss/postcss
- **shadcn/ui**: UI component library with Radix UI primitives

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation
- **@hookform/resolvers**: Integration between React Hook Form and Zod

### Rich Text Editor
- **Tiptap**: Extensible rich text editor
  - @tiptap/react
  - @tiptap/starter-kit
  - @tiptap/extension-link
  - @tiptap/extension-placeholder

### Testing
- **Vitest**: Unit testing framework
- **fast-check**: Property-based testing
- **@testing-library/react**: React component testing
- **jsdom**: DOM implementation for testing

### UI Components (Radix UI)
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- @radix-ui/react-label
- @radix-ui/react-popover
- @radix-ui/react-slot
- @radix-ui/react-toast

### Utilities
- **clsx**: Conditional class names
- **tailwind-merge**: Merge Tailwind classes
- **class-variance-authority**: Component variants
- **lucide-react**: Icon library
- **sharp**: Image optimization

## Configuration Files

- `components.json`: shadcn/ui configuration
- `tsconfig.json`: TypeScript configuration
- `postcss.config.mjs`: PostCSS configuration for Tailwind v4
- `vitest.config.ts`: Vitest testing configuration
- `.env.local`: Environment variables (Supabase credentials)

## Key Features

### Authentication
- Email/password authentication via Supabase Auth
- Protected routes via middleware
- Session management

### Workspace Management
- Multi-tenant architecture
- Role-based access control (owner/member)
- Invitation system

### Case Library
- Store and manage project cases
- Image uploads via Supabase Storage
- Search and filtering

### Proposal Editor
- Rich text editing with Tiptap
- Multiple sections (timeline, team estimate, cases, etc.)
- Auto-save functionality
- Loom video integration
- Preview attachments

### Real-time Collaboration
- Presence tracking
- Live updates via Supabase Realtime
- Conflict resolution

### Public Sharing
- Generate public links for clients
- PDF generation
- No authentication required for viewing

## Development Guidelines

1. **Server Components by Default**: Use Server Components unless interactivity is needed
2. **Server Actions for Mutations**: All data mutations should use Server Actions
3. **Validation**: Always validate input with Zod schemas
4. **Type Safety**: Use TypeScript types from `src/types/database.ts`
5. **Testing**: Write property-based tests for core logic, unit tests for specific cases
6. **Styling**: Use Tailwind CSS utility classes with shadcn/ui components
