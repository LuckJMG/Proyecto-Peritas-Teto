import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CondominioFormData, ValidationErrors } from "@/types/condominio.types";

interface CondominioFormDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  formData: CondominioFormData;
  validationErrors: ValidationErrors;
  submitting: boolean;
  condominioName?: string;
  onOpenChange: (open: boolean) => void;
  onFormChange: (data: Partial<CondominioFormData>) => void;
  onSubmit: () => void;
  onValidationErrorClear: (field: 'nombre' | 'direccion') => void;
}

export default function CondominioFormDialog({
  open,
  mode,
  formData,
  validationErrors,
  submitting,
  condominioName,
  onOpenChange,
  onFormChange,
  onSubmit,
  onValidationErrorClear,
}: CondominioFormDialogProps) {
  const isFormValid = formData.nombre.trim() && formData.direccion.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Añadir Condominio' : 'Editar Condominio'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Ingresa los datos para registrar un nuevo condominio en el sistema.'
              : `Modifica la información del condominio "${condominioName}".`
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre *</Label>
            <Input
              id="nombre"
              placeholder="Ej: Condominio Las Flores"
              value={formData.nombre}
              onChange={(e) => {
                onFormChange({ nombre: e.target.value });
                if (validationErrors.nombre) {
                  onValidationErrorClear('nombre');
                }
              }}
              className={validationErrors.nombre ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {validationErrors.nombre && (
              <p className="text-xs font-medium text-red-500">{validationErrors.nombre}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="direccion">Dirección *</Label>
            <Input
              id="direccion"
              placeholder="Ej: Av. Principal 123"
              value={formData.direccion}
              onChange={(e) => {
                onFormChange({ direccion: e.target.value });
                if (validationErrors.direccion) {
                  onValidationErrorClear('direccion');
                }
              }}
              className={validationErrors.direccion ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {validationErrors.direccion && (
              <p className="text-xs font-medium text-red-500">{validationErrors.direccion}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="total_viviendas">Total de Viviendas</Label>
              <Input
                id="total_viviendas"
                type="number"
                placeholder="0"
                min="0"
                value={formData.total_viviendas || ''}
                onChange={(e) => onFormChange({ total_viviendas: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="ingresos">
                {mode === 'create' ? 'Ingresos Iniciales' : 'Ingresos'}
              </Label>
              <Input
                id="ingresos"
                type="number"
                placeholder="0"
                min="0"
                value={formData.ingresos || ''}
                onChange={(e) => onFormChange({ ingresos: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={onSubmit}
            disabled={submitting || !isFormValid}
            className="bg-[#99D050] hover:bg-[#88bf40] text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creando...' : 'Guardando...'}
              </>
            ) : (
              mode === 'create' ? 'Crear Condominio' : 'Guardar Cambios'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
