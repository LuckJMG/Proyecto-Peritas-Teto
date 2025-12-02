import { useLocation, Link } from "react-router-dom";
import { 
  CalendarDays, 
  Users, 
  Megaphone, 
  LayoutDashboard,
  TriangleAlert,
  Bell,
  BookOpen
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function SidebarAdmin({ className }: SidebarProps) {
  const location = useLocation();
  const pathname = location.pathname;

  const menuItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Usuarios",
      href: "/admin/usuarios",
      icon: Users,
    },
    {
      title: "Reservas",
      href: "/admin/reservas",
      icon: CalendarDays,
    },
    {
      title: "Multas", // Nuevo Item
      href: "/admin/multas",
      icon: TriangleAlert,
    },
    {
      title: "Anuncios",
      href: "/admin/anuncios",
      icon: Megaphone,
    },
    {
      title: "Alertas", // Nuevo Item
      href: "/admin/alertas",
      icon: Bell,
    },
    {
      title: "Libro de registros",
      href: "/admin/registros",
      icon: BookOpen,
    },
  ];

  const activeColor = "#99D050";
  const inactiveColor = "#CCE8A8";

  return (
    <div className={cn("pb-12 w-64 min-h-screen bg-white flex flex-col", className)}>
      <div className="flex-1 py-8">
        {/* Espaciado ajustado para items más grandes */}
        <div className="space-y-3"> 
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                // Padding vertical py-3 para mayor tamaño
                className="group relative w-full flex items-center gap-4 px-6 py-3 transition-all hover:bg-slate-50 focus:outline-none"
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
                  {item.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
