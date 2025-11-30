import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Shield, Users, Home, Building2, Calendar, FileText, KeyRound, Key } from "lucide-react";

// Auth Pages
import Login from "./pages/auth/Login";

// Super Admin Pages
import ListaCondominios from "./pages/super-admin/ListaCondominios";

// Admin Pages
import DashboardCondominio from "./pages/admin/DashboardCondominio";
import ListaUsuarios from "./pages/admin/ListaUsuarios";
import AdminReservasPage from "./pages/admin/Reservas";
import AdminAnunciosPage from "./pages/admin/Anuncios";

// Residente Pages
import EstadoCuentaPage from "./pages/residente/EstadoCuenta";
import SistemaReservasPage from "./pages/residente/SistemaReservas";

function DevHome() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-[#333] p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Casitas Teto - Dev Navigation</h1>
            <p className="text-gray-400 mt-2">Acceso rápido a rutas y credenciales de prueba</p>
          </div>
          <div className="text-right text-xs text-gray-400">
            <p>Environment: Development</p>
            <p>Database: PostgreSQL</p>
          </div>
        </div>
        
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Auth */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-500" /> Autenticación
            </h2>
            <div className="flex flex-col gap-2">
              <Link to="/login" className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
                Iniciar Sesión
              </Link>
            </div>
          </div>

          {/* Super Admin */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-500" /> Super Admin
            </h2>
            <div className="flex flex-col gap-2">
              <Link to="/condominios" className="px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
                Gestión Condominios
              </Link>
            </div>
          </div>

          {/* Admin */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-500" /> Administración
            </h2>
            <div className="flex flex-col gap-2">
              <Link to="/dashboard" className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium">
                Dashboard
              </Link>
              <Link to="/usuarios" className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium">
                <div className="flex items-center gap-2"><Users className="w-4 h-4"/> Usuarios</div>
              </Link>
              <Link to="/admin/reservas" className="px-4 py-2 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors text-sm font-medium">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> Gestión Reservas</div>
              </Link>
            </div>
          </div>

          {/* Residente */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 flex items-center gap-2">
              <Home className="w-5 h-5 text-[#99D050]" /> Residente
            </h2>
            <div className="flex flex-col gap-2">
              <Link to="/estado" className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                <div className="flex items-center gap-2"><FileText className="w-4 h-4"/> Estado de Cuenta</div>
              </Link>
              <Link to="/sistema-reservas" className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium">
                <div className="flex items-center gap-2"><Calendar className="w-4 h-4"/> Mis Reservas</div>
              </Link>
            </div>
          </div>

        </div>

        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Key className="w-4 h-4" /> Credenciales de Prueba (Seed Data)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
            
            {/* Super Admin */}
            <div className="bg-white p-3 rounded border border-purple-200 shadow-sm">
              <span className="font-bold block text-purple-700 mb-1">Super Admin</span>
              User: superadmin@casitasteto.cl<br/>
              Pass: admin123
            </div>

            {/* Admin */}
            <div className="bg-white p-3 rounded border border-orange-200 shadow-sm">
              <span className="font-bold block text-orange-700 mb-1">Administrador</span>
              User: admin@lospinos.cl<br/>
              Pass: admin123
            </div>

            {/* Conserje */}
            <div className="bg-white p-3 rounded border border-blue-200 shadow-sm">
              <span className="font-bold block text-blue-700 mb-1">Conserje</span>
              User: conserje@lospinos.cl<br/>
              Pass: conserje123
            </div>

            {/* Directiva */}
            <div className="bg-white p-3 rounded border border-indigo-200 shadow-sm">
              <span className="font-bold block text-indigo-700 mb-1">Directiva</span>
              User: directiva@lospinos.cl<br/>
              Pass: directiva123
            </div>

            {/* Residente */}
            <div className="bg-white p-3 rounded border border-green-200 shadow-sm border-l-4 border-l-green-500">
              <span className="font-bold block text-green-700 mb-1">Residente (Full Data)</span>
              User: residente@lospinos.cl<br/>
              Pass: residente123
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DevHome />} />
        
        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Super Admin */}
        <Route path="/condominios" element={<ListaCondominios />} />

        {/* Admin */}
        <Route path="/dashboard" element={<DashboardCondominio />} />
        <Route path="/usuarios" element={<ListaUsuarios />} />
        <Route path="/admin/reservas" element={<AdminReservasPage />} />
        <Route path="/admin/anuncios" element={<AdminAnunciosPage />} />

        {/* Residente */}
        <Route path="/estado" element={<EstadoCuentaPage />} />
        <Route path="/sistema-reservas" element={<SistemaReservasPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
