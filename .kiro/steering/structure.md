# Project Structure

## Directory Organization

```
src/
├── app/                    # Next.js App Router (pages, layouts, routes)
│   ├── actions/           # Server Actions for data mutations
│   ├── auth/              # Authentication routes (login, signup, callback)
│   ├── workspace/         # Workspace routes (nested by workspaceId)
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Home/landing page
│   └── globals.css        # Global styles with Tailwind directives
├── components/            # React components organized by feature
│   ├── auth/             # Authentication forms and providers
│   ├── brand/            # Brand settings and preview
│   ├── cases/            # Case library components
│   ├── editor/           # Rich text editor (Tiptap)
│   ├── faq/              # FAQ management
│   ├── proposals/        # Proposal list and management
│   ├── ui/               # shadcn/ui base components
│   └── workspace/        # Workspace settings and member management
├── lib/                  # Utilities and shared logic
│   ├── auth/             # Permission checks and auth utilities
│   ├── supabase/         # Supabase client configurations
│   │   ├── client.ts     # Browser client
│   │   └── server.ts     # Server client (with cookies)
│   ├── validations/      # Zod schemas for all entities
│   ├── test-utils/       # Testing utilities and generators
│   └── utils.ts          # General utility functions (cn, etc.)
├── types/                # TypeScript type definitions
│   ├── database.ts       # Database models and entities
│   ├── errors.ts         # Error types and helpers
│   └── supabase.ts       # Supabase-generated types
└── middleware.ts         # Route protection and auth checks

supabase/
├── migrations/           # Database migration files (numbered)
└── SCHEMA.md            # Database schema documentation
```

## Architectural Patterns

### Server Components First
- Use Server Components by default for better performance
- Only add `'use client'` when needed (forms, interactivity, hooks)
- Server Components can directly query Supabase

### Server Actions for Mutations
- All data mutations go through Server Actions in `src/app/actions/`
- Actions are marked with `'use server'` directive
- Actions return `Result<T>` type for consistent error handling
- Always validate input with Zod schemas before processing

### Validation Layer
- All schemas live in `src/lib/validations/`
- Export both schema and inferred TypeScript type
- Use in both Server Actions (server-side) and forms (client-side)
- Pattern: `export const schema = z.object({...})` and `export type Input = z.infer<typeof schema>`

### Error Handling
- Use `Result<T>` type from `src/types/errors.ts`
- Return `{ success: true, data: T }` or `{ success: false, error: AppError }`
- Error helpers: `validationError()`, `authenticationError()`, `unknownError()`
- Never throw errors in Server Actions, always return Result

### Component Organization
- Group by feature, not by type
- Each feature folder has an `index.ts` for clean exports
- Co-locate tests with components in `__tests__` folders
- Use property-based tests for complex logic (fast-check)

### Supabase Client Usage
- **Server Components/Actions**: Use `createClient()` from `@/lib/supabase/server`
- **Client Components**: Use `createClient()` from `@/lib/supabase/client`
- Server client handles cookies automatically for auth
- Always check RLS policies when querying data

### Styling Conventions
- Use Tailwind utility classes
- Use `cn()` helper from `@/lib/utils` to merge classes conditionally
- shadcn/ui components in `src/components/ui/` are base components
- Customize via className prop, not by editing ui components directly

### Route Structure
- Public routes: `/`, `/auth/*`
- Protected routes: `/workspace/*` (checked by middleware)
- Dynamic routes: `/workspace/[workspaceId]/*`
- Nested routes for features: `/workspace/[workspaceId]/cases`, `/proposals`, `/settings`

### Type Safety
- Import types from `@/types/database` for entities
- Use Supabase-generated types from `@/types/supabase` for queries
- Infer form types from Zod schemas
- Enable strict mode in TypeScript

### Testing Strategy
- Property-based tests for core business logic (auth, permissions, proposals)
- Unit tests for validation schemas
- Component tests for interactive UI
- Test files: `*.test.ts` or `*.test.tsx` in `__tests__` folders
- Use generators from `@/lib/test-utils/generators` for test data

## File Naming Conventions

- Components: PascalCase (e.g., `LoginForm.tsx`, `CaseCard.tsx`)
- Utilities: camelCase (e.g., `utils.ts`, `permissions.ts`)
- Server Actions: camelCase files (e.g., `auth.ts`, `proposals.ts`)
- Types: camelCase files (e.g., `database.ts`, `errors.ts`)
- Tests: Match source file with `.test` suffix (e.g., `auth.test.ts`)

## Import Patterns

```typescript
// Use @ alias for src imports
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { signInSchema } from '@/lib/validations/auth';
import type { User } from '@/types/database';

// Group imports: external, internal, types
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { signIn } from '@/app/actions/auth';

import type { SignInInput } from '@/lib/validations/auth';
```

## Key Conventions

- Always validate user input with Zod before processing
- Use RLS policies for data access control, not application logic
- Revalidate paths after mutations: `revalidatePath('/', 'layout')`
- Use `redirect()` from `next/navigation` for navigation in Server Actions
- Export feature components from index files for clean imports
- Keep Server Actions focused and single-purpose
- Use TypeScript strict mode - no implicit any
