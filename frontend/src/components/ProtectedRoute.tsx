import React, { useEffect } from 'react';
import { authService, RolUsuario } from '@/services/authService';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: RolUsuario[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  useEffect(() => {
    // Verificar autenticación
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    // Verificar roles si se especificaron
    if (allowedRoles && allowedRoles.length > 0) {
      const user = authService.getUser();

      if (!user || !allowedRoles.includes(user.rol)) {
        // Redirigir a la página correspondiente según su rol
        const correctRoute = authService.getRouteByRole(user.rol);
        window.location.href = correctRoute;
      }
    }
  }, [allowedRoles]);

  if (!authService.isAuthenticated()) {
    return null;
  }

  return <>{children}</>;
};
