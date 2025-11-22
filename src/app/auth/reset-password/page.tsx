'use client';

import { useState } from 'react';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { resetPassword } from '@/app/actions/auth';
import type { ResetPasswordInput } from '@/lib/validations/auth';

export default function ResetPasswordPage() {
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: ResetPasswordInput) => {
    setError(undefined);
    setSuccess(false);
    
    const result = await resetPassword(data);
    
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Восстановление пароля
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Введите ваш email для получения ссылки восстановления
          </p>
        </div>
        
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <ResetPasswordForm 
            onSubmit={handleSubmit} 
            error={error}
            success={success}
          />
          
          <div className="mt-6 text-center">
            <a
              href="/auth/login"
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              Вернуться к входу
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
