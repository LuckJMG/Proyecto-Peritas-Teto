import { Link, useLocation } from "react-router-dom";
import { Home, Users, FileText, DollarSign, AlertTriangle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Usuarios", path: "/usuarios" }, // O la ruta que corresponda a Residentes
    { icon: FileText, label: "Anuncios", path: "/admin/anuncios" },
    { icon: DollarSign, label: "Reservas", path: "/admin/reservas" }, // Ajustado según rutas conocidas
    { icon: AlertTriangle, label: "Multas", path: "/admin/multas" },
    { icon: Bell, label: "Alertas", path: "/admin/alertas" }, // NUEVO
  ];

  return (
    <div className={cn("pb-12 w-64 min-h-screen bg-white border-r", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Admin Panel
          </h2>
          <div className="space-y-1">
            {menuItems.map((item, i) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={i}
                  to={item.path}
                  className={cn(
                    "w-full justify-start flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-slate-900 text-white" 
                      : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}