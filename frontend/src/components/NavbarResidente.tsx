import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

interface Residente {
  id: number;
  nombre: string;
  apellido: string;
  vivienda_numero: string;
  condominio: {
    nombre: string;
  };
}

export default function Navbar() {
  const [residente, setResidente] = useState<Residente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResidente = async () => {
      try {
        // Obtener el ID del residente desde localStorage o context
        const residenteId = localStorage.getItem("residenteId");
        if (!residenteId) return;

        const response = await fetch(`/api/v1/residentes/${residenteId}`);
        if (!response.ok) throw new Error("Error al cargar datos");
        
        const data = await response.json();
        setResidente(data);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResidente();
  }, []);

  const nombreCompleto = residente 
    ? `${residente.nombre} ${residente.apellido}` 
    : "Cargando...";
  
  const residencia = residente 
    ? `${residente.vivienda_numero}, ${residente.condominio.nombre}` 
    : "";

  const iniciales = residente 
    ? `${residente.nombre[0]}${residente.apellido[0]}` 
    : "RA";

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo y Nombre */}
        <div className="flex items-center gap-8">
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
        </div>

        {/* Acciones del usuario */}
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity" disabled={loading}>
                <div className="text-left">
                  <div className="text-sm font-semibold text-gray-900">{nombreCompleto}</div>
                  {residencia && (
                    <div className="text-xs text-gray-400">{residencia}</div>
                  )}
                </div>
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://avatar.vercel.sh/${nombreCompleto.toLowerCase().replace(" ", "")}`} />
                  <AvatarFallback className="bg-linear-to-br from-pink-400 via-purple-400 to-blue-400 text-white">
                    {iniciales}
                  </AvatarFallback>
                </Avatar>
              </button>
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
