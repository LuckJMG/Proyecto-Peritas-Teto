// frontend/src/pages/auth/Login.tsx
import React, { useState } from 'react';
import { ImagePanel } from '@/components/auth/ImagePanel';
import { FormPanel } from '@/components/auth/FormPanel';
import { authService } from '@/services/authService';
import type { LoginCredentials } from '@/types/auth.types';

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setError('');
      setLoading(true);

      const data = await authService.login(credentials.email, credentials.password);
      
      // Obtener la ruta según el rol del usuario
      const redirectRoute = authService.getRouteByRole(data.usuario.rol);
      
      // Redirigir a la página correspondiente
      window.location.href = redirectRoute;
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      <ImagePanel />
      <FormPanel onLogin={handleLogin} loading={loading} error={error} />
    </div>
  );
};

export default LoginPage;