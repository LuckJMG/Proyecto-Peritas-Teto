import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RolUsuario } from '@/services/authService';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import ListaCondominios from "@/pages/super-admin/ListaCondominios";
import Login from "@/pages/auth/Login";
import DashboardPage from "@/pages/admin/DashboardCondominio";
import EstadoCuenta from "@/pages/residente/EstadoCuenta";
import ListaUsuarios from "@/pages/admin/ListaUsuarios";
import RegisterPage from "./pages/auth/register";
import SistemaPago from './pages/residente/SistemaPago';
import RegistrosPage from "@/pages/admin/LibroRegistros";
import SistemaReservas from "./pages/residente/SistemaReservas";
import Reservas from "./pages/admin/Reservas";
import AnunciosPage from './pages/admin/Anuncios';
import HistorialPagos from "./pages/residente/HistorialPagos/HistorialPagos";

// PARA LOS QUE VIENEN DESPUES... usen ProtectedRoute para manejar los permisos por rol en las paginas!!!
// no quiero

// Aqui por mientras no se como entrar al admin
//<Route path="/admin/anuncios" element={
//          <ProtectedRoute allowedRoles={[RolUsuario.ADMINISTRADOR]}>
//            <AnunciosPage />
//          </ProtectedRoute>
//        } />

/*

<Route path="/admin/dashboard" element={
          <ProtectedRoute allowedRoles={[
            RolUsuario.ADMINISTRADOR,
            RolUsuario.CONSERJE,
            RolUsuario.DIRECTIVA
          ]}>
            <DashboardPage />
          </ProtectedRoute>
        } />


*/



export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<RegisterPage/>} />
        <Route path="/sistema-reservas" element={<SistemaReservas />} />
        <Route path="/admin/reservas" element={<Reservas />} />

        <Route path="/estado" element={
          <ProtectedRoute allowedRoles={[RolUsuario.RESIDENTE, RolUsuario.ADMINISTRADOR]}>
            <EstadoCuenta />
          </ProtectedRoute>
        } />
        
        <Route path="/admin/dashboard" element={
            <DashboardPage />
        } />
        
        <Route path="/admin/anuncios" element={<AnunciosPage />} />

        <Route path="/super-admin/condominios" element={
          <ProtectedRoute allowedRoles={[RolUsuario.SUPER_ADMINISTRADOR]}>
            <ListaCondominios />
          </ProtectedRoute>
        } />

        <Route path="/admin/usuarios" element={
          // <ProtectedRoute allowedRoles={[RolUsuario.ADMINISTRADOR]}>
            <ListaUsuarios />
          // </ProtectedRoute>
        } />
        
        <Route path="/sistema-pago" element={<SistemaPago />} />
        <Route path="/admin/registros" element={<RegistrosPage />}/>
        <Route path="/historial-pago" element={<HistorialPagos />} />
      </Routes>
    </BrowserRouter>
  );
}
