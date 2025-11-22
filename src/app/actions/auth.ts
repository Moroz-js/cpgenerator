'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import {
  signInSchema,
  signUpSchema,
  resetPasswordSchema,
  type SignInInput,
  type SignUpInput,
  type ResetPasswordInput,
} from '@/lib/validations/auth';
import {
  type Result,
  authenticationError,
  validationError,
  unknownError,
} from '@/types/errors';
import { User } from '@/types/database';

/**
 * Sign in a user with email and password
 */
export async function signIn(input: SignInInput): Promise<Result<User>> {
  try {
    // Validate input
    const validated = signInSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validationError(
          'Invalid login credentials',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.data.email,
      password: validated.data.password,
    });

    if (error) {
      return {
        success: false,
        error: authenticationError('Invalid email or password'),
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: authenticationError('Failed to sign in'),
      };
    }

    revalidatePath('/', 'layout');
    
    return {
      success: true,
      data: {
        id: data.user.id,
        email: data.user.email!,
        fullName: data.user.user_metadata?.full_name,
        avatarUrl: data.user.user_metadata?.avatar_url,
      },
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: unknownError('An error occurred during sign in'),
    };
  }
}

/**
 * Sign up a new user
 */
export async function signUp(input: SignUpInput): Promise<Result<User>> {
  try {
    // Validate input
    const validated = signUpSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validationError(
          'Invalid registration data',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signUp({
      email: validated.data.email,
      password: validated.data.password,
      options: {
        data: {
          full_name: validated.data.fullName,
        },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        return {
          success: false,
          error: authenticationError('User with this email already exists'),
        };
      }
      return {
        success: false,
        error: authenticationError(error.message),
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: authenticationError('Failed to create account'),
      };
    }

    // Profile is created automatically by database trigger
    revalidatePath('/', 'layout');

    return {
      success: true,
      data: {
        id: data.user.id,
        email: data.user.email!,
        fullName: data.user.user_metadata?.full_name,
        avatarUrl: data.user.user_metadata?.avatar_url,
      },
    };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: unknownError('An error occurred during registration'),
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<Result<void>> {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: authenticationError('Failed to sign out'),
      };
    }

    revalidatePath('/', 'layout');
    redirect('/login');
  } catch (error) {
    console.error('Sign out error:', error);
    return {
      success: false,
      error: unknownError('An error occurred during sign out'),
    };
  }
}

/**
 * Send password reset email
 */
export async function resetPassword(
  input: ResetPasswordInput
): Promise<Result<void>> {
  try {
    // Validate input
    const validated = resetPasswordSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validationError(
          'Invalid email',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(
      validated.data.email,
      {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      }
    );

    if (error) {
      return {
        success: false,
        error: authenticationError('Failed to send password reset email'),
      };
    }

    return {
      success: true,
      data: undefined,
    };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: unknownError('An error occurred during password reset'),
    };
  }
}
