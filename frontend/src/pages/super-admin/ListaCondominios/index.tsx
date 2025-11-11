// index.tsx
import { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { condominioService } from "@/services/condominioService";
import SearchBar from "./SearchBar";
import CondominiosTable from "./CondominiosTable";
import DeleteDialog from "./DeleteDialog";
import CondominioFormDialog from "./CondominioFormDialog";
import type { Condominio, SortConfig, ValidationErrors, CondominioFormData } from "./types";

export default function ListaCondominios() {
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [selectedCondominio, setSelectedCondominio] = useState<Condominio | null>(null);
  
  const [newCondominio, setNewCondominio] = useState<CondominioFormData>({
    nombre: "",
    direccion: "",
    total_viviendas: 0,
    ingresos: 0,
  });
  
  const [editCondominio, setEditCondominio] = useState<CondominioFormData>({
    nombre: "",
    direccion: "",
    total_viviendas: 0,
    ingresos: 0,
  });
  
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

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
      
      const { nombreDuplicado, direccionDuplicada } = await condominioService.checkDuplicates(
        newCondominio.nombre,
        newCondominio.direccion
      );
      
      const errors: ValidationErrors = {};
      
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
      
      const { nombreDuplicado, direccionDuplicada } = await condominioService.checkDuplicates(
        editCondominio.nombre,
        editCondominio.direccion,
        selectedCondominio.id
      );
      
      const errors: ValidationErrors = {};
      
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
      const aValue: any = a[sortConfig.key!];
      const bValue: any = b[sortConfig.key!];

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

  const handleValidationErrorClear = (field: 'nombre' | 'direccion') => {
    setValidationErrors({ ...validationErrors, [field]: undefined });
  };

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
                ×
              </button>
            </div>
          )}

          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onAddClick={() => setShowAddDialog(true)}
          />

          <CondominiosTable
            condominios={sortedCondominios}
            sortConfig={sortConfig}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>

      <DeleteDialog
        open={showDeleteDialog}
        condominio={selectedCondominio}
        submitting={submitting}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDelete}
      />

      <CondominioFormDialog
        open={showAddDialog}
        mode="create"
        formData={newCondominio}
        validationErrors={validationErrors}
        submitting={submitting}
        onOpenChange={setShowAddDialog}
        onFormChange={(data) => setNewCondominio({ ...newCondominio, ...data })}
        onSubmit={handleAddCondominio}
        onValidationErrorClear={handleValidationErrorClear}
      />

      <CondominioFormDialog
        open={showEditDialog}
        mode="edit"
        formData={editCondominio}
        validationErrors={validationErrors}
        submitting={submitting}
        condominioName={selectedCondominio?.nombre}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setSelectedCondominio(null);
            setEditCondominio({ nombre: "", direccion: "", total_viviendas: 0, ingresos: 0 });
            setValidationErrors({});
          }
        }}
        onFormChange={(data) => setEditCondominio({ ...editCondominio, ...data })}
        onSubmit={handleUpdateCondominio}
        onValidationErrorClear={handleValidationErrorClear}
      />
    </div>
  );
}
