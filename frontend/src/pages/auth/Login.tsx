import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";
import { CompanyBrand } from "@/components/auth/CompanyBrand";
import { LoginForm } from "@/components/auth/LoginForm";
import { ImagePanel } from "@/components/auth/ImagePanel";
import { Footer as LoginFooter } from "@/components/auth/LoginFooter";
import type { LoginCredentials } from "@/types/auth.types";
import { AlertCircle } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login(credentials.email, credentials.password);
      
      const redirectPath = authService.getRouteByRole(response.usuario.rol);
      navigate(redirectPath);
      
    } catch (err: any) {
      setError(err.message || "Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Left Panel - Form */}
      <div className="flex w-full flex-col justify-between p-8 lg:w-1/2 lg:p-12 xl:p-16">
        <CompanyBrand />
        
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Bienvenido
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>

          {/* Renderizado de error en el padre ya que LoginForm no acepta prop 'error' */}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <LoginForm 
            onSubmit={handleLogin} 
            loading={loading} // Corregido: prop es 'loading', no 'isLoading'
          />
        </div>

        <LoginFooter />
      </div>

      {/* Right Panel - Image */}
      <ImagePanel />
    </div>
  );
}
