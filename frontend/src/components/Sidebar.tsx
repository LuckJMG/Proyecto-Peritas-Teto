import { Home, Users, FileText, DollarSign, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const menuItems = [
    { icon: Home, label: "Condominios", active: false },
    { icon: Users, label: "Residentes", active: false },
    { icon: FileText, label: "Anuncios", active: true }, // Activo para esta vista
    { icon: DollarSign, label: "Pagos", active: false },
    { icon: AlertTriangle, label: "Multas", active: false },
  ];

  return (
    <div className={cn("pb-12 w-64 min-h-screen bg-white border-r", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Admin Panel
          </h2>
          <div className="space-y-1">
            {menuItems.map((item, i) => (
              <button
                key={i}
                className={cn(
                  "w-full justify-start flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  item.active 
                    ? "bg-slate-900 text-white" 
                    : "text-slate-700 hover:bg-slate-100"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}