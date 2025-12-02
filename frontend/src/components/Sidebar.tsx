import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  Megaphone,
  TriangleAlert,
  Bell,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";

interface SidebarAdminProps {
  className?: string;
}

export function SidebarAdmin({ className }: SidebarAdminProps) {
  const location = useLocation();

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
      title: "Multas",
      href: "/admin/multas",
      icon: TriangleAlert,
    },
    {
      title: "Anuncios",
      href: "/admin/anuncios",
      icon: Megaphone,
    },
    {
      title: "Alertas",
      href: "/admin/alertas",
      icon: Bell,
    },
  ];

  return (
    <div className={cn("flex flex-col h-full bg-white w-64", className)}>
      <div className="flex-1 py-6 flex flex-col gap-1 px-3">
        <div className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Menú Principal
        </div>

        {menuItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 font-medium transition-all duration-200",
                  isActive 
                    ? "bg-[#99D050]/10 text-[#7cb342] hover:bg-[#99D050]/20 hover:text-[#7cb342]" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-[#99D050]" : "text-gray-400")} />
                {item.title}
              </Button>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-100">
        <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
                authService.logout();
                window.location.href = "/login";
            }}
        >
          <LogOut className="h-5 w-5" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  );
}
