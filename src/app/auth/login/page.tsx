'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from '@/components/auth/LoginForm';
import { signIn } from '@/app/actions/auth';
import type { SignInInput } from '@/lib/validations/auth';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>();

  const handleSubmit = async (data: SignInInput) => {
    setError(undefined);
    
    const result = await signIn(data);
    
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
            Вход в систему
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Войдите в свой аккаунт для продолжения
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm onSubmit={handleSubmit} error={error} />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Нет аккаунта?
                </span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <a
                href="/auth/signup"
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Зарегистрироваться
              </a>
            </div>
            
            <div className="mt-2 text-center">
              <a
                href="/auth/reset-password"
                className="text-sm text-gray-600 hover:text-gray-500"
              >
                Забыли пароль?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
