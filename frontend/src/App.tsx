import { BrowserRouter, Routes, Route } from "react-router-dom"
import { RolUsuario } from '@/services/authService';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ListaCondominios from "@/pages/super-admin/ListaCondominios"
import Login from "@/pages/auth/Login"
import DashboardPage from "@/pages/admin/DashboardCondominio"
import EstadoCuenta from "@/pages/residente/EstadoCuenta"
import ListaUsuarios from "@/pages/admin/ListaUsuarios";
import RegisterPage from "./pages/auth/register";

// PARA LOS QUE VIENEN DESPUES... usen ProtectedRoute para manejar los permisos por rol en las paginas!!!
// no quiero
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<RegisterPage/>} />

        <Route path="/estado" element={
          <ProtectedRoute allowedRoles={[RolUsuario.RESIDENTE]}>
            <EstadoCuenta />
          </ProtectedRoute>
        } />
        
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={[
            RolUsuario.ADMINISTRADOR,
            RolUsuario.CONSERJE,
            RolUsuario.DIRECTIVA
          ]}>
            <DashboardPage />
          </ProtectedRoute>
        } />
        
        <Route path="/condominios" element={
          <ProtectedRoute allowedRoles={[RolUsuario.SUPER_ADMINISTRADOR]}>
            <ListaCondominios />
          </ProtectedRoute>
        } />

        <Route path="/usuarios" element={
          <ProtectedRoute allowedRoles={[RolUsuario.ADMINISTRADOR]}>
            <ListaUsuarios />
          </ProtectedRoute>
        } />
      </Routes>

      
    </BrowserRouter>
  );
}
