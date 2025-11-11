import React from 'react';
import { ImagePanel } from '@/components/auth/ImagePanel';
import { FormPanel } from '@/components/auth/FormPanel';
import type { LoginCredentials } from '@/types/auth.types';

const LoginPage: React.FC = () => {
  const handleLogin = (credentials: LoginCredentials): void => {
    console.log('Login attempt:', credentials);
    // Aquí irá tu lógica de autenticación con FastAPI
    // Ejemplo:
    // authService.login(credentials.email, credentials.password, credentials.remember)
  };

  return (
    <div className="min-h-screen flex">
      <ImagePanel />
      <FormPanel onLogin={handleLogin} />
    </div>
  );
};

export default LoginPage;