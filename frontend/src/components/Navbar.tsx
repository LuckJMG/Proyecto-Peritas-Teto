import { Bell, ChevronRight, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { authService } from "@/services/authService";

// Función para generar breadcrumbs basados en la ruta
const getBreadcrumbs = (pathname: string) => {
  const paths = pathname.split('/').filter(Boolean);
  
  // Mapa de rutas a nombres legibles
  const routeNames: Record<string, string> = {
    'dashboard': 'Dashboard',
    'usuarios': 'Usuarios',
    'productos': 'Productos',
    'ventas': 'Ventas',
    'reportes': 'Reportes',
    'configuracion': 'Configuración',
    'perfil': 'Perfil',
    'condominios': 'Condominios',
    'estado': 'Estado de Cuenta',
  };

  // Siempre comenzar con Dashboard
  const breadcrumbs = [
    { label: 'Dashboard', path: '/', isLast: paths.length === 0 }
  ];

  // Agregar el resto de las rutas
  paths.forEach((path, index) => {
    breadcrumbs.push({
      label: routeNames[path] || path.charAt(0).toUpperCase() + path.slice(1),
      path: '/' + paths.slice(0, index + 1).join('/'),
      isLast: index === paths.length - 1
    });
  });

  return breadcrumbs;
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const breadcrumbs = getBreadcrumbs(location.pathname);
  
  // Obtener información del usuario
  const user = authService.getUser();
  const userInitials = user 
    ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
    : 'U';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo y Breadcrumbs */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/peritas-teto-logo.png" 
              alt="Logo" 
              className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Breadcrumbs Dinámicos */}
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.path} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                {crumb.isLast ? (
                  <span className="text-gray-900 font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <Link 
                    to={crumb.path}
                    className="text-gray-500 hover:text-gray-900 cursor-pointer transition-colors"
                  >
                    {crumb.label}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center gap-4">
          {/* Notificaciones */}
          <Button variant="ghost" size="icon" className="text-gray-600 hover:text-gray-900 hover:bg-gray-100">
            <Bell className="h-5 w-5" />
          </Button>

          {/* Perfil del usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">
                    {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {user?.rol || 'Usuario'}
                  </div>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 text-white">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link to="/perfil" className="w-full">
                  Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Link to="/configuracion" className="w-full">
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}