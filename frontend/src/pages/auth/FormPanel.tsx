import React from 'react';
import { CompanyBrand } from './CompanyBrand';
import { LoginForm } from './LoginForm';
import { Footer } from './LoginFooter';
import type { FormPanelProps } from '@/types/auth.types';

export const FormPanel: React.FC<FormPanelProps> = ({ 
  onLogin, 
  loading = false, 
  error = '' 
}) => {
  return (
    <div className="w-full lg:w-[40%] flex items-center justify-center p-8 lg:p-12 bg-white min-h-screen">
      <div className="w-full max-w-md space-y-6">
        <CompanyBrand />
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <LoginForm onSubmit={onLogin} loading={loading} />
        <Footer />
      </div>
    </div>
  );
};
