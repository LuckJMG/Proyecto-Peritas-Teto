// frontend/src/pages/auth/Register.tsx
import React, { useState } from 'react';
import { ImagePanel } from '@/components/auth/ImagePanel';
import { CompanyBrand } from '@/components/auth/CompanyBrand';
import { Footer } from '@/components/auth/LoginFooter';
import { RegisterForm } from '@/components/auth/RegisterForm';
import { authService } from '@/services/authService';
import type { RegisterCredentials } from '@/types/auth.types';
import { useNavigate } from 'react-router-dom';

const RegisterPage: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleRegister = async (credentials: RegisterCredentials): Promise<void> => {
    try {
      setError('');
      setLoading(true);

      const data = await authService.registerAndLogin(credentials);
      const ruta = authService.getRouteByRole(data.usuario.rol);
      window.location.href = ruta;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <ImagePanel />
      
      {/* mismo layout que FormPanel */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 lg:p-12 bg-white min-h-screen">
        <div className="w-full max-w-md space-y-6">
          <CompanyBrand />

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <RegisterForm onSubmit={handleRegister} loading={loading} />

          <div className="text-center text-sm">
            <span className="text-gray-600">¿Ya tienes cuenta? </span>
            <button
              type="button"
              className="text-blue-600 hover:underline font-medium"
              onClick={() => navigate('/login')}
            >
              Inicia sesión
            </button>
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;