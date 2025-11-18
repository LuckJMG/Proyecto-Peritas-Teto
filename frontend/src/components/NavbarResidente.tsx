import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { authService } from "@/services/authService";

export default function Navbar() {
  const navigate = useNavigate();
  const user = authService.getUser();

  const nombreCompleto = user 
    ? `${user.nombre} ${user.apellido}` 
    : "Usuario";
  
  const residencia = user?.condominioId 
    ? `Condominio ${user.condominioId}` 
    : "";

  const iniciales = user 
    ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase() 
    : "U";

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo y Nombre */}
        <div className="flex items-center gap-8">
          <Link to="/estado" className="flex items-center gap-3">
            <img 
              src="/peritas-teto-logo.png" 
              alt="Logo" 
              className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
            <p className="font-['Lato'] font-light text-[24px] leading-[100%] tracking-[-0.01em] text-[#000000]">
              Casitas Teto
            </p>
          </Link>
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{nombreCompleto}</div>
                  {residencia && (
                    <div className="text-xs text-gray-400">{residencia}</div>
                  )}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} />
                  <AvatarFallback className="bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 text-white">
                    {iniciales}
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