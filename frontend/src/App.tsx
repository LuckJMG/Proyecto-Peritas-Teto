import { BrowserRouter, Routes, Route } from "react-router-dom"
import { RolUsuario } from '@/services/authService';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ListaCondominios from "@/pages/super-admin/ListaCondominios"
import Login from "@/pages/auth/Login"
import DashboardPage from "@/pages/admin/DashboardCondominio"
import EstadoPage from "@/pages/residente/EstadoCuenta"
import ListaUsuarios from "@/pages/admin/ListaUsuarios";

// PARA LOS QUE VIENEN DESPUES... usen ProtectedRoute para manejar los permisos por rol en las paginas!!!
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/estado" element={
          <ProtectedRoute allowedRoles={[RolUsuario.RESIDENTE]}>
            <EstadoPage />
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
          // <ProtectedRoute allowedRoles={[RolUsuario.SUPER_ADMINISTRADOR]}>
            <ListaCondominios />
          // </ProtectedRoute>
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
