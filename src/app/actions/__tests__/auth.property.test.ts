import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as fc from 'fast-check';
import { signUp, signIn } from '../auth';
import { validCredentialsArb, invalidEmailArb, shortPasswordArb } from '@/lib/test-utils/generators';

// Mock the Supabase modules
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

describe('Authentication Property-Based Tests', () => {
  let mockSupabase: any;
  let mockCreateClient: any;

  beforeEach(async () => {
    // Reset all mocks before each test
    vi.clearAllMocks();
    
    // Create mock Supabase client
    mockSupabase = {
      auth: {
        signUp: vi.fn(),
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
        resetPasswordForEmail: vi.fn(),
      },
    };

    // Mock the createClient function
    const { createClient } = await import('@/lib/supabase/server');
    mockCreateClient = createClient as any;
    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  /**
   * **Feature: proposal-generator, Property 1: Создание аккаунта с валидными данными**
   * 
   * For any valid email and password, account creation should succeed
   * and create a user record in the database.
   * 
   * **Validates: Requirements 1.1**
   */
  it('Property 1: should successfully create account with valid credentials', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArb, async (credentials) => {
        // Setup: Mock successful signup
        const mockUser = {
          id: 'test-user-id',
          email: credentials.email,
          user_metadata: {},
        };
        
        mockSupabase.auth.signUp.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        // Execute
        const result = await signUp({
          email: credentials.email,
          password: credentials.password,
        });

        // Verify
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.email).toBe(credentials.email);
          expect(result.data.id).toBe(mockUser.id);
        }
        
        // Verify Supabase was called with correct credentials
        expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              full_name: undefined,
            },
          },
        });
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: proposal-generator, Property 2: Аутентификация после регистрации**
   * 
   * For any created account, attempting to sign in with the same credentials
   * should be successful (round-trip property).
   * 
   * **Validates: Requirements 1.2**
   */
  it('Property 2: should authenticate successfully after registration (round-trip)', async () => {
    await fc.assert(
      fc.asyncProperty(validCredentialsArb, async (credentials) => {
        // Setup: Mock successful signup
        const mockUser = {
          id: 'test-user-id',
          email: credentials.email,
          user_metadata: {},
        };
        
        mockSupabase.auth.signUp.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        // Step 1: Sign up
        const signUpResult = await signUp({
          email: credentials.email,
          password: credentials.password,
        });

        expect(signUpResult.success).toBe(true);

        // Setup: Mock successful sign in with same credentials
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: mockUser },
          error: null,
        });

        // Step 2: Sign in with same credentials
        const signInResult = await signIn({
          email: credentials.email,
          password: credentials.password,
        });

        // Verify: Sign in should succeed
        expect(signInResult.success).toBe(true);
        if (signInResult.success && signUpResult.success) {
          expect(signInResult.data.email).toBe(signUpResult.data.email);
          expect(signInResult.data.id).toBe(signUpResult.data.id);
        }
      }),
      { numRuns: 100 }
    );
  });

  /**
   * **Feature: proposal-generator, Property 3: Отклонение невалидных учетных данных**
   * 
   * For any invalid credentials (wrong password, non-existent email),
   * sign in attempt should be rejected.
   * 
   * **Validates: Requirements 1.5**
   */
  it('Property 3: should reject invalid credentials', async () => {
    // Test with invalid email format
    await fc.assert(
      fc.asyncProperty(
        invalidEmailArb,
        fc.string({ minLength: 8, maxLength: 50 }),
        async (invalidEmail, password) => {
          // Execute
          const result = await signIn({
            email: invalidEmail,
            password: password,
          });

          // Verify: Should fail validation
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.type).toBe('validation');
          }
        }
      ),
      { numRuns: 50 }
    );

    // Test with empty or whitespace-only password
    await fc.assert(
      fc.asyncProperty(
        validCredentialsArb.map(c => c.email),
        fc.string({ minLength: 0, maxLength: 20 }).filter(s => s.trim().length === 0),
        async (email, emptyPassword) => {
          // Execute
          const result = await signIn({
            email: email,
            password: emptyPassword,
          });

          // Verify: Should fail validation
          expect(result.success).toBe(false);
          if (!result.success) {
            expect(result.error.type).toBe('validation');
          }
        }
      ),
      { numRuns: 50 }
    );

    // Test with wrong password (authentication error from Supabase)
    await fc.assert(
      fc.asyncProperty(validCredentialsArb, async (credentials) => {
        // Setup: Mock authentication failure
        mockSupabase.auth.signInWithPassword.mockResolvedValue({
          data: { user: null },
          error: { message: 'Invalid login credentials' },
        });

        // Execute
        const result = await signIn({
          email: credentials.email,
          password: credentials.password,
        });

        // Verify: Should fail authentication
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.type).toBe('authentication');
        }
      }),
      { numRuns: 50 }
    );
  });
});
