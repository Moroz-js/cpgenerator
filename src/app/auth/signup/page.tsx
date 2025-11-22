'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { signUp } from '@/app/actions/auth';
import type { SignUpInput } from '@/lib/validations/auth';

export default function SignUpPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();

  const handleSubmit = async (data: SignUpInput) => {
    setError(undefined);
    
    const result = await signUp(data);
    
    if (result.success) {
      router.push('/');
      router.refresh();
    } else {
      setError(result.error.message);
    }
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
