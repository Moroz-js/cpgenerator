import { describe, it, expect } from 'vitest';
import { signUpSchema, signInSchema, resetPasswordSchema } from '../auth';

describe('Auth Validation Schemas', () => {
  describe('signUpSchema', () => {
    it('should validate correct sign up data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
      };

      const result = signUpSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'password123',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject short password', () => {
      const invalidData = {
        email: 'test@example.com',
        password: 'short',
      };

      const result = signUpSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('signInSchema', () => {
    it('should validate correct sign in data', () => {
      const validData = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = signInSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('resetPasswordSchema', () => {
    it('should validate correct email', () => {
      const validData = {
        email: 'test@example.com',
      };

      const result = resetPasswordSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'not-an-email',
      };

      const result = resetPasswordSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
