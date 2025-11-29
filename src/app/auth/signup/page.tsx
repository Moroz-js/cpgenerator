'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { signUp } from '@/app/actions/auth';
import type { SignUpInput } from '@/lib/validations/auth';

export default function SignUpPage() {
  console.log('=== SignUpPage RENDER ===');
  console.log('Environment:', {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
  });

  const router = useRouter();
  const [error, setError] = useState<string>();

  const handleSubmit = async (data: SignUpInput) => {
    console.log('=== SIGNUP SUBMIT START ===');
    console.log('Email:', data.email);
    console.log('Full name:', data.fullName);
    console.log('Password length:', data.password?.length);
    
    setError(undefined);
    
    try {
      const result = await signUp(data);
      
      console.log('Signup result:', {
        success: result.success,
        error: result.success ? null : result.error,
      });
      
      if (result.success) {
        console.log('Signup successful, redirecting to /');
        router.push('/');
        router.refresh();
      } else {
        console.error('Signup failed:', result.error.message);
        setError(result.error.message);
      }
    } catch (err) {
      console.error('Signup exception:', err);
      setError('Произошла ошибка при регистрации');
    }
    
    console.log('=== SIGNUP SUBMIT END ===');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Регистрация
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Создайте новый аккаунт
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignUpForm onSubmit={handleSubmit} error={error} />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Уже есть аккаунт?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href="/auth/login"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Войти
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
