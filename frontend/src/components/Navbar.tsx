import { ChevronRight, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { authService, RolUsuario } from "@/services/authService";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getUser();

  // Función para formatear el rol de manera legible
  const formatRole = (rol: string | undefined) => {
    if (!rol) return 'Invitado';
    
    const roleMap: Record<string, string> = {
      [RolUsuario.SUPER_ADMINISTRADOR]: "Super Administrador",
      [RolUsuario.ADMINISTRADOR]: "Administrador",
      [RolUsuario.CONSERJE]: "Conserje",
      [RolUsuario.DIRECTIVA]: "Directiva",
      [RolUsuario.RESIDENTE]: "Residente"
    };

    // Si el rol está en el mapa, lo usamos. Si no, formateamos el string original (ej: ROL_TEST -> Rol Test)
    return roleMap[rol] || rol.charAt(0).toUpperCase() + rol.slice(1).toLowerCase().replace(/_/g, ' ');
  };

  // Determinar la ruta "Home" según el rol
  const getHomeRoute = () => {
    if (!user) return "/";
    switch (user.rol) {
      case RolUsuario.SUPER_ADMINISTRADOR: return "/super/condominios";
      case RolUsuario.ADMINISTRADOR:
      case RolUsuario.CONSERJE: 
      case RolUsuario.DIRECTIVA: return "/admin/dashboard";
      case RolUsuario.RESIDENTE: return "/resumen";
      default: return "/";
    }
  };

  const homeRoute = getHomeRoute();

  // Generador de Breadcrumbs Personalizado
  const getBreadcrumbs = (pathname: string) => {
    // 1. Definir rutas "Home" que no deben mostrar > Página
    const homeRoutes = [
        "/admin/dashboard", 
        "/super/condominios", 
        "/resumen"
    ];

    // Si estamos en una ruta home, solo mostrar "Dashboard"
    if (homeRoutes.includes(pathname) || pathname === "/") {
        return [{ label: "Dashboard", path: homeRoute, isLast: true }];
    }

    // 2. Para rutas hijas, construir Dashboard > Página
    const breadcrumbs = [
        { label: "Dashboard", path: homeRoute, isLast: false }
    ];

    // Mapa de nombres legibles para segmentos de URL
    const routeNames: Record<string, string> = {
        'usuarios': 'Usuarios',
        'reservas': 'Reservas',
        'multas': 'Multas',
        'anuncios': 'Anuncios',
        'condominios': 'Condominios',
        'historial': 'Historial de Pagos',
        'pago': 'Sistema de Pago',
        'detalle': 'Detalle de Gastos'
    };

    const segments = pathname.split('/').filter(Boolean);
    
    // Filtramos segmentos "técnicos" que no queremos en el breadcrumb visual
    const cleanSegments = segments.filter(seg => 
        !['admin', 'super', 'residente'].includes(seg) && 
        seg !== 'dashboard'
    );

    cleanSegments.forEach((segment, index) => {
        const label = routeNames[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
        const isLast = index === cleanSegments.length - 1;
        
        // Reconstrucción correcta de la ruta para el link
        const originalIndex = segments.lastIndexOf(segment);
        const path = "/" + segments.slice(0, originalIndex + 1).join("/");

        breadcrumbs.push({
            label: label,
            path: path,
            isLast: isLast
        });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs(location.pathname);

  const userInitials = user 
    ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
    : 'U';

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <nav className="bg-background border-b border-border px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo y Breadcrumbs */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link to={homeRoute} className="flex items-center gap-2">
            <img 
              src="/peritas-teto-logo.png" 
              alt="Logo" 
              className="h-20 w-auto cursor-pointer hover:opacity-80 transition-opacity"
            />
          </Link>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={index} className="flex items-center gap-2">
                {index > 0 && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                {crumb.isLast ? (
                  <span className="text-foreground font-medium">
                    {crumb.label}
                  </span>
                ) : (
                  <Link 
                    to={crumb.path}
                    className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 hover:opacity-80 transition-opacity outline-none">
                <div className="text-left hidden sm:block">
                  <div className="text-sm font-semibold text-foreground">
                    {user ? `${user.nombre} ${user.apellido}` : 'Usuario'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatRole(user?.rol)}
                  </div>
                </div>
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarImage src={`https://avatar.vercel.sh/${user?.email}`} />
                  <AvatarFallback className="bg-linear-to-br from-pink-400 via-purple-400 to-blue-400 text-white font-bold">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 cursor-pointer focus:text-red-700 focus:bg-red-50"
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
