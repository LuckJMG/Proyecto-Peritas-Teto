import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LogOut, Home, Calendar, FileText, Megaphone, AlertTriangle } from "lucide-react";
import { authService } from "@/services/authService";
import { cn } from "@/lib/utils";

export default function NavbarResidente() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getUser();

  const nombreCompleto = user 
    ? `${user.nombre} ${user.apellido}` 
    : "Usuario";
  
  const residencia = user?.condominio_id 
    ? `Condominio ${user.condominio_id}` 
    : "";

  const iniciales = user 
    ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase() 
    : "U";

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/resumen', label: 'Estado de Cuenta', icon: Home },
    { path: '/reservas', label: 'Reservas', icon: Calendar },
    { path: '/historial', label: 'Historial de Pagos', icon: FileText },
    { path: '/anuncios', label: 'Anuncios', icon: Megaphone },
    { path: '/multas', label: 'Multas', icon: AlertTriangle },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <img 
            src="/peritas-teto-logo.png" 
            alt="Logo" 
            className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity"
          />
          <p className="font-['Lato'] font-light text-[24px] leading-[100%] tracking-[-0.01em] text-[#000000]">
            Casitas Teto
          </p>
        </Link>

        {/* Menu de Navegación */}
        <div className="hidden md:flex items-center gap-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-[#99D050] text-white" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Perfil del usuario */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-semibold text-gray-900">{nombreCompleto}</div>
                  {residencia && (
                    <div className="text-xs text-gray-400">{residencia}</div>
                  )}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} />
                  <AvatarFallback className="bg-linear-to-br from-pink-400 via-purple-400 to-blue-400 text-white">
                    {iniciales}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* Menu items visible en mobile */}
              <div className="md:hidden">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem
                      key={item.path}
                      onClick={() => navigate(item.path)}
                    >
                      <Icon className="mr-2 h-4 w-4" />
                      {item.label}
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
              </div>

              <DropdownMenuItem onClick={() => navigate('/perfil')}>
                Perfil
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/configuracion')}>
                Configuración
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
