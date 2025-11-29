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
  console.log('=== signIn SERVER ACTION START ===');
  console.log('Input email:', input.email);
  console.log('Environment check:', {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
  });
  
  try {
    // Validate input
    const validated = signInSchema.safeParse(input);
    console.log('Validation result:', { success: validated.success });
    
    if (!validated.success) {
      console.error('Validation failed:', validated.error.flatten());
      return {
        success: false,
        error: validationError(
          'Invalid login credentials',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    console.log('Creating Supabase client...');
    const supabase = await createClient();
    console.log('Supabase client created successfully');
    
    console.log('Attempting signInWithPassword...');
    console.log('Request details:', {
      email: validated.data.email,
      passwordLength: validated.data.password.length,
    });
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validated.data.email,
      password: validated.data.password,
    });

    console.log('Supabase response:', {
      hasData: !!data,
      hasUser: !!data?.user,
      hasSession: !!data?.session,
      error: error ? { message: error.message, status: error.status } : null,
    });

    if (error) {
      console.error('Supabase auth error:', JSON.stringify(error, null, 2));
      return {
        success: false,
        error: authenticationError('Invalid email or password'),
      };
    }

    if (!data.user) {
      console.error('No user data returned from signIn');
      return {
        success: false,
        error: authenticationError('Failed to sign in'),
      };
    }

    console.log('SignIn successful:', {
      userId: data.user.id,
      email: data.user.email,
      hasSession: !!data.session,
    });

    revalidatePath('/', 'layout');
    
    console.log('=== signIn SERVER ACTION END (SUCCESS) ===');
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
    console.error('=== signIn SERVER ACTION ERROR ===');
    console.error('Sign in exception:', JSON.stringify(error, null, 2));
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
  console.log('=== signUp SERVER ACTION START ===');
  console.log('Input:', { email: input.email, fullName: input.fullName });
  console.log('Environment check:', {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
  });
  
  try {
    // Validate input
    const validated = signUpSchema.safeParse(input);
    console.log('Validation result:', { success: validated.success });
    
    if (!validated.success) {
      console.error('Validation failed:', validated.error.flatten());
      return {
        success: false,
        error: validationError(
          'Invalid registration data',
          validated.error.flatten().fieldErrors as Record<string, string[]>
        ),
      };
    }

    console.log('Creating Supabase client...');
    const supabase = await createClient();
    console.log('Supabase client created successfully');
    
    console.log('Attempting signUp...');
    console.log('Request details:', {
      email: validated.data.email,
      passwordLength: validated.data.password.length,
      fullName: validated.data.fullName,
    });
    
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
      console.error('No user data returned from signUp');
      return {
        success: false,
        error: authenticationError('Failed to create account'),
      };
    }

    console.log('SignUp successful:', {
      userId: data.user.id,
      email: data.user.email,
      hasSession: !!data.session,
    });

    // Profile is created automatically by database trigger
    revalidatePath('/', 'layout');

    console.log('=== signUp SERVER ACTION END (SUCCESS) ===');
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
    console.error('=== signUp SERVER ACTION ERROR ===');
    console.error('Sign up exception:', JSON.stringify(error, null, 2));
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
