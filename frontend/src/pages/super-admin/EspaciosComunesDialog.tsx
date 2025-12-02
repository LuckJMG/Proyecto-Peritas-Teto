import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Building2, Users, DollarSign, Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
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
  ESTACIONAMIENTO: 'bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200',
  QUINCHO: 'bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200',
  MULTICANCHA: 'bg-green-100 text-green-800 hover:bg-green-100 border-green-200',
  SALA_EVENTOS: 'bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200',
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
      const data = await espaciosComunesService.getByCondominio(condominio.id);
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
      <div className="flex justify-between items-center mb-6">
        <DialogDescription>
          Gestiona los espacios comunes de <strong>{condominio?.nombre}</strong>
        </DialogDescription>
        <Button
          onClick={handleAdd}
          size="sm"
          className="bg-[#99D050] hover:bg-[#88bf40] text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Añadir Nuevo
        </Button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-[#99D050] mb-4" />
          <p className="text-sm text-muted-foreground">Cargando espacios comunes...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 mb-4">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      ) : espacios.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-900">No hay espacios comunes registrados</p>
          <p className="text-sm text-muted-foreground mt-1">
            Haz clic en "Añadir Nuevo" para comenzar
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
          {espacios.map((espacio) => (
            <Card key={espacio.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-1">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{espacio.nombre}</h3>
                      <Badge variant="outline" className={TIPO_COLORS[espacio.tipo]}>
                        {TIPO_LABELS[espacio.tipo]}
                      </Badge>
                    </div>
                    {espacio.descripcion && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{espacio.descripcion}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm pt-2">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Capacidad: <strong>{espacio.capacidad}</strong></span>
                      </div>
                      
                      {espacio.requiere_pago && espacio.costo_por_hora !== null && espacio.costo_por_hora > 0 ? (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>{formatCurrency(espacio.costo_por_hora)}/hora</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-green-600 font-medium">
                          <DollarSign className="h-4 w-4" />
                          <span>Uso gratuito</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => handleEdit(espacio)}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => handleDeleteClick(espacio)}
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex justify-end mt-6">
        <Button onClick={() => onOpenChange(false)} variant="outline">
          Cerrar
        </Button>
      </div>
    </>
  );

  const renderFormMode = () => (
    <>
      <div className="flex items-center gap-2 mb-6">
        <Button
          onClick={handleCancel}
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <DialogDescription>
          {mode === 'add' ? 'Ingresa los datos del nuevo espacio.' : `Modificando: ${selectedEspacio?.nombre}`}
        </DialogDescription>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid gap-4 py-2">
        <div className="grid gap-2">
          <Label htmlFor="nombre">Nombre *</Label>
          <Input
            id="nombre"
            placeholder="Ej: Estacionamiento Visita"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
          />
          {mode === 'add' && cantidad > 1 && (
            <p className="text-xs text-muted-foreground">
              Se añadirá un número al final (Ej: {formData.nombre} 1, {formData.nombre} 2...)
            </p>
          )}
        </div>

        {mode === 'add' && (
          <div className="grid gap-2">
            <Label htmlFor="cantidad">Cantidad a crear</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              max="50"
              value={cantidad}
              onChange={(e) => setCantidad(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
            />
            <p className="text-xs text-muted-foreground">
              Crea múltiples espacios idénticos de una vez.
            </p>
          </div>
        )}

        <div className="grid gap-2">
          <Label htmlFor="tipo">Tipo *</Label>
          <Select
            value={formData.tipo}
            onValueChange={(value) => setFormData({ ...formData, tipo: value as EspacioComun['tipo'] })}
          >
            <SelectTrigger id="tipo">
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

        <div className="grid gap-2">
          <Label htmlFor="capacidad">Capacidad (Personas) *</Label>
          <Input
            id="capacidad"
            type="number"
            min="1"
            value={formData.capacidad}
            onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) || 1 })}
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="descripcion">Descripción</Label>
          <Input
            id="descripcion"
            placeholder="Detalles adicionales..."
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
          />
        </div>

        <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <Checkbox
            id="requierePago"
            checked={formData.requiere_pago}
            onCheckedChange={(checked) => setFormData({ ...formData, requiere_pago: checked as boolean })}
          />
          <div className="space-y-1 leading-none">
            <Label htmlFor="requierePago" className="cursor-pointer">
              Requiere pago para reservar
            </Label>
            <p className="text-xs text-muted-foreground">
              Si se marca, los residentes deberán pagar para usar este espacio.
            </p>
          </div>
        </div>

        {formData.requiere_pago && (
          <div className="grid gap-2 animate-in slide-in-from-top-2">
            <Label htmlFor="costo">Costo por hora (CLP)</Label>
            <Input
              id="costo"
              type="number"
              min="0"
              value={formData.costo_por_hora || ''}
              onChange={(e) => setFormData({ ...formData, costo_por_hora: parseFloat(e.target.value) || 0 })}
            />
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-6">
        <Button onClick={handleCancel} variant="outline" disabled={submitting} className="flex-1">
          Cancelar
        </Button>
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
            mode === 'add' ? `Crear ${cantidad > 1 ? `${cantidad} Espacios` : 'Espacio'}` : 'Guardar Cambios'
          )}
        </Button>
      </div>
    </>
  );

  const renderDeleteMode = () => (
    <>
      <div className="flex flex-col items-center justify-center text-center py-6">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="h-6 w-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">¿Eliminar espacio común?</h3>
        <DialogDescription className="text-center max-w-[80%] mt-2">
          Estás a punto de eliminar <strong>"{selectedEspacio?.nombre}"</strong>. 
          Esta acción no se puede deshacer y afectará a las reservas históricas.
        </DialogDescription>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <Button onClick={handleCancel} variant="outline" disabled={submitting} className="flex-1">
          Cancelar
        </Button>
        <Button
          onClick={handleConfirmDelete}
          disabled={submitting}
          variant="destructive"
          className="flex-1"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Eliminando...
            </>
          ) : (
            'Sí, eliminar'
          )}
        </Button>
      </div>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#99D050]" />
            {mode === 'delete' ? 'Confirmar Eliminación' : 'Espacios Comunes'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1">
          {mode === 'list' && renderListMode()}
          {(mode === 'add' || mode === 'edit') && renderFormMode()}
          {mode === 'delete' && renderDeleteMode()}
        </div>
      </DialogContent>
    </Dialog>
  );
}
