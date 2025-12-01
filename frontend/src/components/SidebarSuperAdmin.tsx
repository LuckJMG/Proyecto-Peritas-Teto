import { useLocation, Link } from "react-router-dom";
import { 
  Building2, // Ícono de edificio para Superadmin
  CalendarDays, 
  Users, 
  Megaphone, 
  FileText,
  Plus,
  Home,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarSuperAdmin({ className }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;

  // Rutas para Super Admin
  const menuItems = [
    // Apunta a la lista principal de condominios
    { href: "/condominios", label: "Condominios", icon: Building2 },
    // El resto pueden ser vistas globales o placeholders por ahora
    { href: "/superadmin/reservas", label: "Reservas", icon: CalendarDays },
    { href: "/superadmin/usuarios", label: "Usuarios", icon: Users },
    { href: "/superadmin/anuncios", label: "Anuncios", icon: Megaphone },
    { href: "/superadmin/registro", label: "Registro", icon: FileText },
  ];

  const activeColor = "#99D050";
  const inactiveColor = "#CCE8A8";
  
  // Estilo base para los botones superiores
  const topButtonStyle = "w-full bg-[#99D050] hover:bg-[#8bc345] text-white rounded-xl py-3 px-4 shadow-md transition-all transform active:scale-95 flex items-center justify-center gap-3 group";

  return (
    <div className={cn("pb-12 w-64 min-h-screen bg-white flex flex-col", className)}>
      
      {/* === SECCIÓN DE BOTONES SUPERIORES === */}
      <div className="px-6 pt-8 pb-6 space-y-4">
        
        {/* Botón 1: Agregar Condominio */}
        <Link to="/condominios/crear"> {/* Link placeholder */}
            <button className={topButtonStyle}>
            <div className="relative">
                <Home className="w-7 h-7" />
                <Plus className="w-3.5 h-3.5 absolute -top-1 -right-1 stroke-[3]" />
            </div>
            <div className="flex flex-col items-start leading-tight">
                <span className="text-sm font-medium">Agregar</span>
                <span className="text-base font-bold">Condominio</span>
            </div>
            </button>
        </Link>
        
        {/* Botón 2: Lista Condominios */}
        <Link to="/condominios">
            <button className={topButtonStyle}>
            <List className="w-7 h-7" />
            <div className="flex flex-col items-start leading-tight text-left">
                <span className="text-sm font-medium">Lista</span>
                <span className="text-base font-bold">Condominios</span>
            </div>
            </button>
        </Link>
      </div>

      {/* === LISTA DE NAVEGACIÓN === */}
      <div className="flex-1 py-2">
        <div className="space-y-6">
          {menuItems.map((item) => {
            // Lógica para marcar activo: si estamos en /condominios o rutas hijas
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                to={item.href}
                className="group relative w-full flex items-center gap-4 px-6 py-1 transition-all hover:bg-slate-50 focus:outline-none"
              >
                {isActive && (
                  <div 
                    className="absolute left-0 top-0 bottom-0 w-[5px] rounded-r-sm"
                    style={{ backgroundColor: activeColor }}
                  />
                )}

                <item.icon 
                  className="h-6 w-6 transition-colors duration-200"
                  style={{ color: isActive ? activeColor : inactiveColor }}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                <span 
                  className={cn(
                    "text-base transition-colors duration-200",
                    isActive 
                      ? "font-bold text-slate-800" 
                      : "font-normal text-gray-500"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}