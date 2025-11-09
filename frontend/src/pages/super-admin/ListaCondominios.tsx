import { useState } from "react";
import { Bell, Moon, Search, ChevronDown, ChevronRight, Eye, Trash2, Home } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Tipos
interface Condominio {
  id: number;
  nombre: string;
  ingresos: string;
  ingresosValor: number;
  fecha: string;
}

interface SortConfig {
  key: keyof Condominio | null;
  direction: 'asc' | 'desc';
}

// Datos de ejemplo
const condominios: Condominio[] = [
  { id: 1, nombre: "Condominio 1", ingresos: "$-1.000.000", ingresosValor: -1000000, fecha: "Oct 20, 2024" },
  { id: 2, nombre: "Condominio 2", ingresos: "$-200.000", ingresosValor: -200000, fecha: "Oct 20, 2024" },
  { id: 3, nombre: "Condominio 3", ingresos: "$-10", ingresosValor: -10, fecha: "Oct 20, 2024" },
  { id: 4, nombre: "Condominio 4", ingresos: "$60.000.000", ingresosValor: 60000000, fecha: "Oct 20, 2024" },
  { id: 5, nombre: "Condominio 5", ingresos: "$2.000.000", ingresosValor: 2000000, fecha: "Oct 20, 2024" },
  { id: 6, nombre: "Condominio 6", ingresos: "$5.000", ingresosValor: 5000, fecha: "Oct 20, 2024" },
  { id: 7, nombre: "Condominio 7", ingresos: "$2", ingresosValor: 2, fecha: "Oct 20, 2024" },
  { id: 8, nombre: "Condominio 8", ingresos: "$0.5", ingresosValor: 0.5, fecha: "Oct 20, 2024" },
  { id: 86, nombre: "Condominio 86", ingresos: "$logit", ingresosValor: 0, fecha: "Oct 20, 2024" },
];

export default function ListaCondominios() {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [selectedCondominio, setSelectedCondominio] = useState<Condominio | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});
  const [newCondominioName, setNewCondominioName] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  const getIngresosColor = (valor: number): string => {
    if (valor < 0) return "bg-red-400";
    if (valor > 1000000) return "bg-green-400";
    return "bg-lime-300";
  };

  const toggleRow = (id: number) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDelete = (condominio: Condominio) => {
    setSelectedCondominio(condominio);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    console.log("Eliminando condominio:", selectedCondominio);
    setShowDeleteDialog(false);
    setSelectedCondominio(null);
  };

  const handleAddCondominio = () => {
    console.log("Agregando condominio:", newCondominioName);
    setShowAddDialog(false);
    setNewCondominioName("");
  };

  const handleSort = (key: keyof Condominio) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedCondominios = (condominios: Condominio[]): Condominio[] => {
    if (!sortConfig.key) return condominios;

    return [...condominios].sort((a, b) => {
      let aValue: string | number = a[sortConfig.key!];
      let bValue: string | number = b[sortConfig.key!];

      // Para ingresos, usar el valor numérico
      if (sortConfig.key === 'ingresos') {
        aValue = a.ingresosValor;
        bValue = b.ingresosValor;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredCondominios = condominios.filter((condo: Condominio) =>
    condo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCondominios = getSortedCondominios(filteredCondominios);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <img 
                src="/peritas-teto-logo.png" 
                alt="Logo" 
                className="h-10 w-auto"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500 hover:text-gray-700 cursor-pointer">
                Dashboard
              </span>
              <span className="text-gray-400">/</span>
              <span className="font-medium text-gray-900">Título</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full text-lime-400">
              <Moon className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full relative text-lime-400">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-green-500 rounded-full"></span>
            </Button>
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

      {/* Contenido principal */}
      <div className="p-6">
        <div className="mx-auto max-w-7xl">
          {/* Barra de búsqueda y botón añadir */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Buscar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-green-500 hover:bg-green-600 text-white font-medium border-0"
              style={{ backgroundColor: '#22c55e' }}
            >
              <div className="relative mr-2">
                <Home className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 text-xs font-bold">+</span>
              </div>
              Añadir Condominio
            </Button>
          </div>

          {/* Tabla */}
          <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="w-12 p-4"></th>
                  <th className="w-16 p-4 text-left text-sm font-medium text-gray-700">CI</th>
                  <th className="p-4 text-left text-sm font-medium text-gray-700">
                    <button 
                      onClick={() => handleSort('nombre')}
                      className="flex items-center gap-1 hover:text-gray-900 cursor-pointer"
                    >
                      Nombre del condominio
                      <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${
                        sortConfig.key === 'nombre' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                      }`} />
                    </button>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-700">
                    <button 
                      onClick={() => handleSort('ingresos')}
                      className="flex items-center gap-1 hover:text-gray-900 cursor-pointer"
                    >
                      Ingresos
                      <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${
                        sortConfig.key === 'ingresos' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                      }`} />
                    </button>
                  </th>
                  <th className="p-4 text-left text-sm font-medium text-gray-700">
                    <button 
                      onClick={() => handleSort('fecha')}
                      className="flex items-center gap-1 hover:text-gray-900 cursor-pointer"
                    >
                      Última modificación
                      <ChevronDown className={`h-4 w-4 text-gray-600 transition-transform ${
                        sortConfig.key === 'fecha' && sortConfig.direction === 'desc' ? 'rotate-180' : ''
                      }`} />
                    </button>
                  </th>
                  <th className="p-4 text-right text-sm font-medium text-gray-700">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sortedCondominios.map((condo) => (
                  <>
                    <tr key={condo.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <button
                          onClick={() => toggleRow(condo.id)}
                          className="h-8 w-8 flex items-center justify-center hover:bg-gray-200 rounded"
                        >
                          {expandedRows[condo.id] ? (
                            <ChevronDown className="h-5 w-5 text-gray-700" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-gray-700" />
                          )}
                        </button>
                      </td>
                      <td className="p-4 font-medium text-sm">CI</td>
                      <td className="p-4 text-sm">{condo.nombre}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium text-white ${getIngresosColor(condo.ingresosValor)}`}>
                          <span className="text-xs">◉</span>
                          {condo.ingresos}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          {condo.fecha}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="bg-gray-800 hover:bg-gray-900 text-white">
                              Administrar
                              <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver condominio
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(condo)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Aniquilar condominio
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                    {expandedRows[condo.id] && (
                      <tr>
                        <td colSpan={6} className="bg-gray-50 p-4">
                          <div className="text-sm text-gray-600">
                            Información adicional del {condo.nombre}...
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Dialog de eliminación */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              ¿Deshabilitar condominio?
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 pt-2">
              ¿Estás seguro de que quieres Deshabilitar este condominio?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={confirmDelete}
              className="w-full bg-red-400 hover:bg-red-500 text-white"
            >
              Deshabilitar
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(false)}
              variant="outline"
              className="w-full"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de añadir condominio */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Añadir Condominio
            </DialogTitle>
            <DialogDescription className="text-base text-gray-600 pt-2">
              Ingresa el nombre del nuevo condominio
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nombre del condominio"
              value={newCondominioName}
              onChange={(e) => setNewCondominioName(e.target.value)}
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleAddCondominio}
              className="w-full bg-lime-400 hover:bg-lime-500 text-gray-900"
              disabled={!newCondominioName.trim()}
            >
              Crear Condominio
            </Button>
            <Button
              onClick={() => setShowAddDialog(false)}
              variant="outline"
              className="w-full"
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}