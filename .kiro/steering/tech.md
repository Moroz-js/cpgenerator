# Technology Stack

## Core Framework

- **Next.js 16**: React framework with App Router (Server Components by default)
- **React 19**: UI library with React Compiler enabled
- **TypeScript 5**: Strict mode enabled for type safety
- **Node.js**: Target ES2017

## Backend & Database

- **Supabase**: Backend-as-a-Service
  - PostgreSQL database with Row Level Security (RLS)
  - Authentication (email/password)
  - Storage (images, attachments)
  - Realtime subscriptions for collaboration
- **Server Actions**: All data mutations use Next.js Server Actions (marked with `'use server'`)

## Styling & UI

- **Tailwind CSS v4**: Utility-first CSS with @tailwindcss/postcss
- **shadcn/ui**: Component library built on Radix UI primitives
- **Radix UI**: Accessible component primitives (Dialog, Dropdown, Popover, Toast, etc.)
- **Lucide React**: Icon library
- **class-variance-authority**: Component variant management
- **tailwind-merge + clsx**: Conditional class merging

## Forms & Validation

- **React Hook Form**: Form state management
- **Zod v4**: Schema validation and type inference
- **@hookform/resolvers**: Integration between React Hook Form and Zod

## Rich Text Editor

- **Tiptap**: Extensible rich text editor
  - @tiptap/react
  - @tiptap/starter-kit
  - @tiptap/extension-link
  - @tiptap/extension-placeholder
  - @tiptap/html (for serialization)

## Testing

- **Vitest**: Unit testing framework with jsdom environment
- **@testing-library/react**: Component testing utilities
- **@testing-library/jest-dom**: Custom matchers
- **fast-check**: Property-based testing library

## Development Tools

- **ESLint**: Linting with Next.js config
- **PostCSS**: CSS processing for Tailwind v4
- **Sharp**: Image optimization

## Common Commands

```bash
# Development
npm run dev              # Start dev server on localhost:3000

# Building
npm run build            # Production build
npm start                # Start production server

# Testing
npm test                 # Run tests once
npm run test:watch       # Run tests in watch mode
npm run test:ui          # Run tests with Vitest UI

# Linting
npm run lint             # Run ESLint
```

## Path Aliases

- `@/*` maps to `./src/*` for clean imports

## Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_SITE_URL`: Application URL for redirects

## Key Configuration Files

- `next.config.ts`: Next.js config (React Compiler enabled, Supabase image domains)
- `tsconfig.json`: TypeScript config with strict mode and path aliases
- `vitest.config.ts`: Test configuration with jsdom and path aliases
- `components.json`: shadcn/ui configuration
- `postcss.config.mjs`: PostCSS config for Tailwind v4
- `eslint.config.mjs`: ESLint configuration
