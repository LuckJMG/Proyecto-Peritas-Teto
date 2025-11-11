import React from 'react';
import { CompanyBrand } from './CompanyBrand';
import { LoginForm } from '../auth/LoginForm';
import { GoogleSignInButton } from '../auth/GoogleSignInButton';
import { RegisterLink } from '../auth/RegisterLink';
import { Footer } from './LoginFooter';
import type { FormPanelProps } from '@/types/auth.types';

export const FormPanel: React.FC<FormPanelProps> = ({ onLogin }) => {
  return (
    <div className="w-full lg:w-[40%] flex items-center justify-center p-8 lg:p-12 bg-white min-h-screen">
      <div className="w-full max-w-md space-y-6">
        <CompanyBrand />
        <LoginForm onSubmit={onLogin} />
        <GoogleSignInButton />
        <RegisterLink />
        <Footer />
      </div>
    </div>
  );
};