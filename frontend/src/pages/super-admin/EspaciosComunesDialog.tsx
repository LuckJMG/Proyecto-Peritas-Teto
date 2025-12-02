import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Building2, Users, DollarSign, Plus, Edit, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { espaciosComunesService } from "@/services/espaciosComunesService";
import type { EspacioComun, EspacioComunInput } from "@/services/espaciosComunesService";
import type { Condominio } from "@/types/condominio.types";

interface EspaciosComunesDialogProps {
  open: boolean;
  condominio: Condominio | null;
  onOpenChange: (open: boolean) => void;
}

type DialogMode = 'list' | 'add' | 'edit' | 'delete';

const TIPO_LABELS: Record<string, string> = {
  ESTACIONAMIENTO: 'Estacionamiento',
  QUINCHO: 'Quincho',
  MULTICANCHA: 'Multicancha',
  SALA_EVENTOS: 'Sala de Eventos',
};

const TIPO_COLORS: Record<string, string> = {
  ESTACIONAMIENTO: 'bg-blue-100 text-blue-800',
  QUINCHO: 'bg-orange-100 text-orange-800',
  MULTICANCHA: 'bg-green-100 text-green-800',
  SALA_EVENTOS: 'bg-purple-100 text-purple-800',
};

const INITIAL_FORM: Omit<EspacioComunInput, 'condominio_id'> = {
  nombre: '',
  tipo: 'ESTACIONAMIENTO',
  capacidad: 1,
  costo_por_hora: 0,
  descripcion: '',
  requiere_pago: false,
};

export default function EspaciosComunesDialog({
  open,
  condominio,
  onOpenChange,
}: EspaciosComunesDialogProps) {
  const [espacios, setEspacios] = useState<EspacioComun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<DialogMode>('list');
  const [selectedEspacio, setSelectedEspacio] = useState<EspacioComun | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [cantidad, setCantidad] = useState(1);

  useEffect(() => {
    if (open && condominio?.id) {
      loadEspaciosComunes();
      setMode('list');
      setFormData(INITIAL_FORM);
      setCantidad(1);
      setError(null);
    }
  }, [open, condominio?.id]);

  const loadEspaciosComunes = async () => {
    if (!condominio?.id) return;

    try {
      setLoading(true);
      setError(null);

      console.log('Cargando espacios para condominio:', condominio.id);
      const data = await espaciosComunesService.getByCondominio(condominio.id);
      console.log('Espacios cargados:', data);
      setEspacios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar espacios comunes');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData(INITIAL_FORM);
    setCantidad(1);
    setMode('add');
    setError(null);
  };

  const handleEdit = (espacio: EspacioComun) => {
    setSelectedEspacio(espacio);
    setFormData({
      nombre: espacio.nombre,
      tipo: espacio.tipo,
      capacidad: espacio.capacidad,
      costo_por_hora: espacio.costo_por_hora,
      descripcion: espacio.descripcion,
      requiere_pago: espacio.requiere_pago,
    });
    setMode('edit');
    setError(null);
  };

  const handleDeleteClick = (espacio: EspacioComun) => {
    setSelectedEspacio(espacio);
    setMode('delete');
    setError(null);
  };

  const handleSubmitAdd = async () => {
    if (!condominio?.id || !formData.nombre.trim()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      for (let i = 0; i < cantidad; i++) {
        const espacioData: EspacioComunInput = {
          ...formData,
          condominio_id: condominio.id,
          nombre: cantidad > 1 ? `${formData.nombre} ${i + 1}` : formData.nombre,
        };

        await espaciosComunesService.create(espacioData);
      }

      await loadEspaciosComunes();
      setMode('list');
      setFormData(INITIAL_FORM);
      setCantidad(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear espacios comunes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedEspacio?.id || !formData.nombre.trim()) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      await espaciosComunesService.update(selectedEspacio.id, formData);
      await loadEspaciosComunes();
      setMode('list');
      setSelectedEspacio(null);
      setFormData(INITIAL_FORM);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar espacio común');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedEspacio?.id) return;

    try {
      setSubmitting(true);
      setError(null);

      await espaciosComunesService.delete(selectedEspacio.id);
      await loadEspaciosComunes();
      setMode('list');
      setSelectedEspacio(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar espacio común');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setMode('list');
    setSelectedEspacio(null);
    setFormData(INITIAL_FORM);
    setCantidad(1);
    setError(null);
  };

  const formatCurrency = (value: number | null): string => {
    if (value === null || value === 0) return "Gratis";
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const renderListMode = () => (
    <>
      <div className="flex justify-between items-center mb-4">
        <DialogDescription className="text-sm text-gray-600">
          Espacios disponibles en {condominio?.nombre}
        </DialogDescription>
        <Button
          onClick={handleAdd}
          size="sm"
          className="bg-[#99D050] hover:bg-[#88bf40] text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Añadir
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-[#99D050] mb-4" />
          <p className="text-sm text-gray-600">Cargando espacios comunes...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      ) : espacios.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-sm text-gray-600">No hay espacios comunes registrados</p>
          <p className="text-xs text-gray-500 mt-1">
            Haz clic en "Añadir" para crear el primer espacio común
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {espacios.map((espacio) => (
            <div
              key={espacio.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{espacio.nombre}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${TIPO_COLORS[espacio.tipo]}`}>
                      {TIPO_LABELS[espacio.tipo]}
                    </span>
                  </div>
                  {espacio.descripcion && (
                    <p className="text-sm text-gray-600 mt-1">{espacio.descripcion}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => handleEdit(espacio)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteClick(espacio)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-gray-700">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>Capacidad: <strong>{espacio.capacidad}</strong></span>
                </div>
                
                {espacio.requiere_pago && espacio.costo_por_hora !== null && espacio.costo_por_hora > 0 && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <DollarSign className="h-4 w-4 text-gray-500" />
                    <span>
                      {formatCurrency(espacio.costo_por_hora)}/hora
                    </span>
                  </div>
                )}
                
                {!espacio.requiere_pago && (
                  <div className="flex items-center gap-2 text-green-700">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Uso gratuito</span>
                  </div>
                )}

                <div className={`ml-auto px-2 py-1 rounded-full text-xs font-medium ${
                  espacio.activo 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {espacio.activo ? 'Activo' : 'Inactivo'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-4">
        <Button onClick={() => onOpenChange(false)} variant="outline">
          Cerrar
        </Button>
      </div>
    </>
  );

  const renderFormMode = () => (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Button
          onClick={handleCancel}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
        </Button>
        <DialogDescription className="text-sm text-gray-600">
          {mode === 'add' ? 'Crear nuevos espacios comunes' : `Editar "${selectedEspacio?.nombre}"`}
        </DialogDescription>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Nombre *
          </label>
          <Input
            placeholder="Ej: Estacionamiento Visita"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
          {mode === 'add' && cantidad > 1 && (
            <p className="text-xs text-gray-500 mt-1">
              Se añadirá un número al final de cada espacio (Ej: {formData.nombre} 1, {formData.nombre} 2...)
            </p>
          )}
        </div>

        {mode === 'add' && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Cantidad a crear
            </label>
            <Input
              type="number"
              min="1"
              max="50"
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
            />
            <p className="text-xs text-gray-500 mt-1">
              Crea múltiples espacios con las mismas características
            </p>
          </div>
        )}

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Tipo *
          </label>
          <Select
            value={formData.tipo}
            onValueChange={(value) => setFormData({ ...formData, tipo: value as EspacioComun['tipo'] })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIPO_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Capacidad *
          </label>
          <Input
            type="number"
            min="1"
            value={formData.capacidad}
            onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) || 1 })}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Descripción
          </label>
          <Input
            placeholder="Descripción del espacio común"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="requierePago"
            checked={formData.requiere_pago}
            onChange={(e) => setFormData({ ...formData, requiere_pago: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300 text-[#99D050] focus:ring-[#99D050]"
          />
          <label htmlFor="requierePago" className="text-sm text-gray-700">
            Requiere pago
          </label>
        </div>

        {formData.requiere_pago && (
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Costo por hora (CLP)
            </label>
            <Input
              type="number"
              min="0"
              value={formData.costo_por_hora || ''}
              onChange={(e) => setFormData({ ...formData, costo_por_hora: parseFloat(e.target.value) || 0 })}
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <Button
          onClick={mode === 'add' ? handleSubmitAdd : handleSubmitEdit}
          disabled={submitting || !formData.nombre.trim()}
          className="flex-1 bg-[#99D050] hover:bg-[#88bf40] text-white"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {mode === 'add' ? 'Creando...' : 'Guardando...'}
            </>
          ) : (
            mode === 'add' ? `Crear ${cantidad > 1 ? `${cantidad} espacios` : 'espacio'}` : 'Guardar cambios'
          )}
        </Button>
        <Button onClick={handleCancel} variant="outline" disabled={submitting}>
          Cancelar
        </Button>
      </div>
    </>
  );

  const renderDeleteMode = () => (
    <>
      <DialogDescription className="text-sm text-gray-600 pt-2 mb-4">
        ¿Estás seguro de que quieres eliminar el espacio común "{selectedEspacio?.nombre}"?
        Esta acción no se puede deshacer.
      </DialogDescription>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleConfirmDelete}
          disabled={submitting}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Eliminando...
            </>
          ) : (
            'Eliminar'
          )}
        </Button>
        <Button onClick={handleCancel} variant="outline" disabled={submitting}>
          Cancelar
        </Button>
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#99D050]" />
            {mode === 'delete' ? 'Eliminar Espacio Común' : 'Espacios Comunes'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {mode === 'list' && renderListMode()}
          {(mode === 'add' || mode === 'edit') && renderFormMode()}
          {mode === 'delete' && renderDeleteMode()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
