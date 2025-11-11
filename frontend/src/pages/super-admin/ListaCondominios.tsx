// frontend/src/pages/super-admin/ListaCondominios.tsx
import { useState, useEffect } from "react";
import { Search, ArrowUpDown, Eye, Trash2, Home, ChevronDown, Loader2, AlertCircle, Edit } from "lucide-react";
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
import { condominioService } from "@/services/condominioService";
import type { Condominio } from "@/services/condominioService";

interface SortConfig {
  key: keyof Condominio | null;
  direction: 'asc' | 'desc';
}

export default function ListaCondominios() {
  // Estados
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  
  // Estados para diálogos
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [selectedCondominio, setSelectedCondominio] = useState<Condominio | null>(null);
  
  // Estados para formulario de creación
  const [newCondominio, setNewCondominio] = useState({
    nombre: "",
    direccion: "",
    total_viviendas: 0,
    ingresos: 0,
  });
  
  // Estados para formulario de edición
  const [editCondominio, setEditCondominio] = useState({
    nombre: "",
    direccion: "",
    total_viviendas: 0,
    ingresos: 0,
  });
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<{
    nombre?: string;
    direccion?: string;
  }>({});

  // Cargar condominios al montar el componente
  useEffect(() => {
    loadCondominios();
  }, []);

  const loadCondominios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await condominioService.getAll();
      setCondominios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar condominios');
      console.error('Error loading condominios:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number): string => {
    if (value === 0) return "$0";
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getIngresosColor = (valor: number): string => {
    if (valor < 0) return "bg-[#e05959]";
    return "bg-[#bbd386]";
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDelete = (condominio: Condominio) => {
    setSelectedCondominio(condominio);
    setShowDeleteDialog(true);
  };

  const handleEdit = (condominio: Condominio) => {
    setSelectedCondominio(condominio);
    setEditCondominio({
      nombre: condominio.nombre,
      direccion: condominio.direccion,
      total_viviendas: condominio.total_viviendas,
      ingresos: condominio.ingresos,
    });
    setValidationErrors({});
    setShowEditDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedCondominio?.id) return;

    try {
      setSubmitting(true);
      await condominioService.disable(selectedCondominio.id);
      await loadCondominios();
      setShowDeleteDialog(false);
      setSelectedCondominio(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al deshabilitar condominio');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddCondominio = async () => {
    if (!newCondominio.nombre.trim() || !newCondominio.direccion.trim()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      setValidationErrors({});
      
      // Verificar duplicados
      const { nombreDuplicado, direccionDuplicada } = await condominioService.checkDuplicates(
        newCondominio.nombre,
        newCondominio.direccion
      );
      
      const errors: { nombre?: string; direccion?: string } = {};
      
      if (nombreDuplicado) {
        errors.nombre = 'Ya existe un condominio con este nombre';
      }
      
      if (direccionDuplicada) {
        errors.direccion = 'Ya existe un condominio en esta dirección';
      }
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setSubmitting(false);
        return;
      }
      
      await condominioService.create(newCondominio);
      await loadCondominios();
      setShowAddDialog(false);
      setNewCondominio({ nombre: "", direccion: "", total_viviendas: 0, ingresos: 0 });
      setValidationErrors({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear condominio');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCondominio = async () => {
    if (!editCondominio.nombre.trim() || !editCondominio.direccion.trim()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (!selectedCondominio?.id) return;

    try {
      setSubmitting(true);
      setError(null);
      setValidationErrors({});
      
      // Verificar duplicados excluyendo el condominio actual
      const { nombreDuplicado, direccionDuplicada } = await condominioService.checkDuplicates(
        editCondominio.nombre,
        editCondominio.direccion,
        selectedCondominio.id
      );
      
      const errors: { nombre?: string; direccion?: string } = {};
      
      if (nombreDuplicado) {
        errors.nombre = 'Ya existe un condominio con este nombre';
      }
      
      if (direccionDuplicada) {
        errors.direccion = 'Ya existe un condominio en esta dirección';
      }
      
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        setSubmitting(false);
        return;
      }
      
      await condominioService.update(selectedCondominio.id, editCondominio);
      await loadCondominios();
      setShowEditDialog(false);
      setSelectedCondominio(null);
      setEditCondominio({ nombre: "", direccion: "", total_viviendas: 0, ingresos: 0 });
      setValidationErrors({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar condominio');
    } finally {
      setSubmitting(false);
    }
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
      let aValue: any = a[sortConfig.key!];
      let bValue: any = b[sortConfig.key!];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const filteredCondominios = condominios.filter((condo) =>
    condo.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedCondominios = getSortedCondominios(filteredCondominios);

  // Estado de loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-80px)]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-12 w-12 animate-spin text-[#99D050]" />
            <p className="text-gray-600">Cargando condominios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          )}

          {/* Header con búsqueda y botón */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="relative w-80">
              <Input
                type="text"
                placeholder="Buscar condominio..."
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

          {/* Tabla */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#e5e5e5] border-b border-gray-300">
                <tr>
                  <th className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleSort('nombre')}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 mx-auto"
                    >
                      Nombre del condominio
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleSort('direccion')}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 mx-auto"
                    >
                      Dirección
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleSort('ingresos')}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 mx-auto"
                    >
                      Ingresos
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleSort('fecha_creacion')}
                      className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 mx-auto"
                    >
                      Fecha de creación
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-center">
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-700 mx-auto">
                      Acciones
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCondominios.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      No se encontraron condominios
                    </td>
                  </tr>
                ) : (
                  sortedCondominios.map((condo, index) => {
                    return (
                      <tr
                        key={condo.id}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F3F3F3]'} hover:bg-gray-100 transition-colors border-b border-gray-200`}
                      >
                        <td className="px-4 py-4 text-sm text-gray-900 text-center">
                          {condo.nombre}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-700 text-center">
                          {condo.direccion}
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-white ${getIngresosColor(condo.ingresos)}`}>
                            <span className="text-xs">●</span>
                            {formatCurrency(condo.ingresos)}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
                              <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                              <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                              <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                            </svg>
                            <span>{formatDate(condo.fecha_creacion)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
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
                                <DropdownMenuItem onClick={() => handleEdit(condo)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar condominio
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(condo)}
                                  className="text-[#e05959]"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Deshabilitar condominio
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
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
              ¿Estás seguro de que quieres deshabilitar "{selectedCondominio?.nombre}"?
              Esta acción marcará el condominio como inactivo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col gap-2 sm:flex-col mt-4">
            <Button
              onClick={confirmDelete}
              disabled={submitting}
              className="w-full bg-[#e05959] hover:bg-[#d04848] text-white"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deshabilitando...
                </>
              ) : (
                'Deshabilitar'
              )}
            </Button>
            <Button
              onClick={() => setShowDeleteDialog(false)}
              variant="outline"
              className="w-full"
              disabled={submitting}
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
              Completa la información del nuevo condominio
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nombre *
              </label>
              <Input
                placeholder="Ej: Condominio Las Flores"
                value={newCondominio.nombre}
                onChange={(e) => {
                  setNewCondominio({ ...newCondominio, nombre: e.target.value });
                  if (validationErrors.nombre) {
                    setValidationErrors({ ...validationErrors, nombre: undefined });
                  }
                }}
                className={`w-full ${validationErrors.nombre ? 'border-red-500' : ''}`}
              />
              {validationErrors.nombre && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.nombre}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Dirección *
              </label>
              <Input
                placeholder="Ej: Av. Principal 123"
                value={newCondominio.direccion}
                onChange={(e) => {
                  setNewCondominio({ ...newCondominio, direccion: e.target.value });
                  if (validationErrors.direccion) {
                    setValidationErrors({ ...validationErrors, direccion: undefined });
                  }
                }}
                className={`w-full ${validationErrors.direccion ? 'border-red-500' : ''}`}
              />
              {validationErrors.direccion && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.direccion}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Total de Viviendas *
              </label>
              <Input
                type="number"
                placeholder="Ej: 50"
                min="0"
                value={newCondominio.total_viviendas || ''}
                onChange={(e) => setNewCondominio({ ...newCondominio, total_viviendas: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Ingresos Iniciales
              </label>
              <Input
                type="number"
                placeholder="Ej: 0"
                value={newCondominio.ingresos || ''}
                onChange={(e) => setNewCondominio({ ...newCondominio, ingresos: parseFloat(e.target.value) || 0 })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Deja en 0 para comenzar sin ingresos</p>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleAddCondominio}
              disabled={submitting || !newCondominio.nombre.trim() || !newCondominio.direccion.trim()}
              className="w-full bg-[#99D050] hover:bg-[#88bf40] text-white font-medium"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                'Crear Condominio'
              )}
            </Button>
            <Button
              onClick={() => setShowAddDialog(false)}
              variant="outline"
              className="w-full"
              disabled={submitting}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de editar condominio */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Editar Condominio
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 pt-2">
              Modifica la información del condominio "{selectedCondominio?.nombre}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nombre *
              </label>
              <Input
                placeholder="Ej: Condominio Las Flores"
                value={editCondominio.nombre}
                onChange={(e) => {
                  setEditCondominio({ ...editCondominio, nombre: e.target.value });
                  if (validationErrors.nombre) {
                    setValidationErrors({ ...validationErrors, nombre: undefined });
                  }
                }}
                className={`w-full ${validationErrors.nombre ? 'border-red-500' : ''}`}
              />
              {validationErrors.nombre && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.nombre}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Dirección *
              </label>
              <Input
                placeholder="Ej: Av. Principal 123"
                value={editCondominio.direccion}
                onChange={(e) => {
                  setEditCondominio({ ...editCondominio, direccion: e.target.value });
                  if (validationErrors.direccion) {
                    setValidationErrors({ ...validationErrors, direccion: undefined });
                  }
                }}
                className={`w-full ${validationErrors.direccion ? 'border-red-500' : ''}`}
              />
              {validationErrors.direccion && (
                <p className="text-xs text-red-600 mt-1">{validationErrors.direccion}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Total de Viviendas *
              </label>
              <Input
                type="number"
                placeholder="Ej: 50"
                min="0"
                value={editCondominio.total_viviendas || ''}
                onChange={(e) => setEditCondominio({ ...editCondominio, total_viviendas: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Ingresos
              </label>
              <Input
                type="number"
                placeholder="Ej: 0"
                value={editCondominio.ingresos || ''}
                onChange={(e) => setEditCondominio({ ...editCondominio, ingresos: parseFloat(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
              onClick={handleUpdateCondominio}
              disabled={submitting || !editCondominio.nombre.trim() || !editCondominio.direccion.trim()}
              className="w-full bg-[#99D050] hover:bg-[#88bf40] text-white font-medium"
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
            <Button
              onClick={() => {
                setShowEditDialog(false);
                setSelectedCondominio(null);
                setEditCondominio({ nombre: "", direccion: "", total_viviendas: 0, ingresos: 0 });
                setValidationErrors({});
              }}
              variant="outline"
              className="w-full"
              disabled={submitting}
            >
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}