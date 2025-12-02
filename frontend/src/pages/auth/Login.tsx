import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { authService } from "@/services/authService";
import { CompanyBrand } from "./CompanyBrand";
import { LoginForm } from "./LoginForm";
import { ImagePanel } from "./ImagePanel";
import { Footer as LoginFooter } from "./LoginFooter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { LoginCredentials } from "@/types/auth.types";

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
      <div className="flex w-full flex-col justify-between p-8 lg:w-1/2 lg:p-12 xl:p-16">
        <CompanyBrand />

        <div className="mx-auto w-full max-w-sm space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <LoginForm 
            onSubmit={handleLogin} 
            loading={loading}
          />
        </div>

        <LoginFooter />
      </div>

      <ImagePanel />
    </div>
  );
}
