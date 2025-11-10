import { useState } from "react";
import { Search, ArrowUpDown, Eye, Trash2, Home, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import Navbar from "@/components/Navbar";

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
  const [newCondominioName, setNewCondominioName] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });

  const getIngresosColor = (valor: number): string => {
    if (valor < 0) return "bg-[#e05959]";
    return "bg-[#bbd386]";
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
      {/* Navbar importado como componente */}
      <Navbar />

      {/* Contenido principal */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header con búsqueda y botón */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-80">
              <Input
                type="text"
                placeholder="Condominio"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-4 pr-10 bg-white border-gray-300 rounded-full h-12 text-gray-700 placeholder:text-gray-400"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <div className="w-px h-6 bg-gray-300"></div>
                <Search className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-[#99D050] hover:bg-[#88bf40] text-white font-medium"
            >
              <Home className="h-4 w-4 mr-2" />
              Añadir Condominio
            </Button>
          </div>

          {/* Tabla mejorada */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#e5e5e5] border-b border-gray-300">
                <tr>
                  <th className="px-4 py-2 text-center"> {/* CAMBIO: text-center */}
                    <button
                      onClick={() => handleSort('nombre')}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 mx-auto" // CAMBIO: mx-auto
                    >
                      Nombre del condominio
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-center"> {/* CAMBIO: text-center */}
                    <button
                      onClick={() => handleSort('ingresos')}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 mx-auto" // CAMBIO: mx-auto
                    >
                      Ingresos
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-center"> {/* CAMBIO: text-center */}
                    <button
                      onClick={() => handleSort('fecha')}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 mx-auto" // CAMBIO: mx-auto
                    >
                      Última modificación
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-center"> {/* CAMBIO: text-center */}
                    <button
                      disabled
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 mx-auto" // CAMBIO: mx-auto
                    >
                      Acciones
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCondominios.map((condo, index) => (
                  <tr
                    key={condo.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F3F3F3]'} hover:bg-gray-100 transition-colors border-b border-gray-200`}
                  >
                    <td className="px-4 py-4 text-sm text-gray-900 text-center"> {/* CAMBIO: text-center */}
                      {condo.nombre}
                    </td>
                    <td className="px-4 py-4 text-center"> {/* CAMBIO: text-center */}
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-white ${getIngresosColor(condo.ingresosValor)}`}>
                        <span className="text-xs">●</span>
                        {condo.ingresos}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      {/* CAMBIO: justify-center agregado al div interno */}
                      <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                          <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                          <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                          <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                        </svg>
                        <span>{condo.fecha}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      {/* Esta celda ya estaba centrada con flex justify-center */}
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button className="bg-[#404040] hover:bg-[#303030] text-white text-sm flex items-center gap-2">
                              Administrar
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver condominio
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDelete(condo)}
                              className="text-[#e05959]"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Aniquilar condominio
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
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
            <DialogTitle className="text-xl font-semibold">
              ¿Deshabilitar condominio?
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 pt-2">
              ¿Estás seguro de que quieres Deshabilitar este condominio?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col mt-4">
            <Button
              onClick={confirmDelete}
              className="w-full bg-[#e05959] hover:bg-[#d04848] text-white"
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
            <DialogTitle className="text-xl font-semibold">
              Añadir Condominio
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 pt-2">
              Ingresa el nombre del nuevo condominio
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nombre del condominio"
              value={newCondominioName}
              onChange={(e) => setNewCondominioName(e.target.value)}
              className="w-full"
            />
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleAddCondominio}
              className="w-full bg-[#99D050] hover:bg-[#88bf40] text-white font-medium"
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