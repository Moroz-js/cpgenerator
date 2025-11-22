import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  signUpSchema,
  signInSchema,
  createWorkspaceSchema,
  createCaseSchema,
  createProposalSchema,
} from '../index';
import {
  emailArb,
  validCredentialsArb,
  invalidEmailArb,
  shortPasswordArb,
  nonEmptyStringArb,
  uuidArb,
} from '@/lib/test-utils/generators';

describe('Validation Schemas', () => {
  describe('signUpSchema', () => {
    it('should accept valid email and password', () => {
      fc.assert(
        fc.property(validCredentialsArb, (credentials) => {
          const result = signUpSchema.safeParse(credentials);
          expect(result.success).toBe(true);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject invalid email', () => {
      fc.assert(
        fc.property(invalidEmailArb, fc.string({ minLength: 8 }), (email, password) => {
          const result = signUpSchema.safeParse({ email, password });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });

    it('should reject short password', () => {
      fc.assert(
        fc.property(emailArb, shortPasswordArb, (email, password) => {
          const result = signUpSchema.safeParse({ email, password });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('signInSchema', () => {
    it('should accept valid email and any non-empty password', () => {
      fc.assert(
        fc.property(
          emailArb, 
          fc.string({ minLength: 1 }).filter(s => s.trim().length > 0), 
          (email, password) => {
            const result = signInSchema.safeParse({ email, password });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid email', () => {
      fc.assert(
        fc.property(invalidEmailArb, fc.string({ minLength: 1 }), (email, password) => {
          const result = signInSchema.safeParse({ email, password });
          expect(result.success).toBe(false);
        }),
        { numRuns: 100 }
      );
    });
  });

  describe('createWorkspaceSchema', () => {
    it('should accept valid workspace name', () => {
      fc.assert(
        fc.property(
          nonEmptyStringArb.filter(s => s.trim().length >= 2),
          (name) => {
            const result = createWorkspaceSchema.safeParse({ name });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject empty workspace name', () => {
      const result = createWorkspaceSchema.safeParse({ name: '' });
      expect(result.success).toBe(false);
    });
  });

  describe('createCaseSchema', () => {
    it('should accept valid case data', () => {
      fc.assert(
        fc.property(
          uuidArb,
          nonEmptyStringArb,
          (workspaceId, title) => {
            const result = createCaseSchema.safeParse({
              workspaceId,
              title,
              technologies: [],
              images: [],
            });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid workspace ID', () => {
      const result = createCaseSchema.safeParse({
        workspaceId: 'not-a-uuid',
        title: 'Test Case',
      });
      expect(result.success).toBe(false);
    });
  });

  describe('createProposalSchema', () => {
    it('should accept valid proposal data', () => {
      fc.assert(
        fc.property(
          uuidArb,
          nonEmptyStringArb,
          (workspaceId, title) => {
            const result = createProposalSchema.safeParse({
              workspaceId,
              title,
            });
            expect(result.success).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject negative amounts in payment schedule', () => {
      fc.assert(
        fc.property(
          uuidArb,
          nonEmptyStringArb,
          fc.integer({ min: -1000, max: -1 }),
          (workspaceId, title, amount) => {
            const result = createProposalSchema.safeParse({
              workspaceId,
              title,
              paymentSchedule: [
                {
                  date: '2024-01-01',
                  amount,
                  description: 'Payment',
                },
              ],
            });
            expect(result.success).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
