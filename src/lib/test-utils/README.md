# Test Utilities

This directory contains utilities for testing the application.

## Files

### `render.tsx`
Custom render function that wraps components with necessary providers for testing.

Usage:
```typescript
import { render, screen } from '@/lib/test-utils';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### `mocks.ts`
Mock data for testing, including:
- Mock users, workspaces, cases, proposals, templates, comments
- Mock Supabase client

Usage:
```typescript
import { mockUser, mockWorkspace, mockProposal } from '@/lib/test-utils';

test('uses mock data', () => {
  expect(mockUser.email).toBe('test@example.com');
});
```

### `generators.ts`
Property-based testing generators using fast-check.

Usage:
```typescript
import * as fc from 'fast-check';
import { userArb, proposalArb } from '@/lib/test-utils/generators';

test('property test', () => {
  fc.assert(
    fc.property(userArb, (user) => {
      // Test that holds for all generated users
      expect(user.email).toContain('@');
    }),
    { numRuns: 100 }
  );
});
```

## Property-Based Testing

All property-based tests should:
1. Run at least 100 iterations (`{ numRuns: 100 }`)
2. Be tagged with a comment referencing the design document property:
   ```typescript
   // **Feature: proposal-generator, Property 1: Создание аккаунта с валидными данными**
   ```
3. Use generators from `generators.ts` to create test data

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui
```
