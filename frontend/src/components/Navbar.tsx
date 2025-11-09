import { Bell, Moon } from "lucide-react";
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

export default function Navbar() {
  return (
    <nav className="border-b bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo y Breadcrumbs */}
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img 
              src="/peritas-teto-logo.png" 
              alt="Logo" 
              className="h-10 w-auto"
            />
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 hover:text-gray-700 cursor-pointer">
              Dashboard
            </span>
            <span className="text-gray-400">/</span>
            <span className="font-medium text-gray-900">Título</span>
          </div>
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center gap-3">
          {/* Botón de tema oscuro */}
          <Button variant="ghost" size="icon" className="rounded-full">
            <Moon className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Notificaciones */}
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-green-500 rounded-full"></span>
          </Button>

          {/* Perfil del usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 h-auto py-1 px-2 hover:bg-gray-50">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Ricardo Alvear</p>
                  <p className="text-xs text-gray-500">Administrador</p>
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://avatar.vercel.sh/ricardoalvear" />
                  <AvatarFallback className="bg-purple-500 text-white">RA</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configuración</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}