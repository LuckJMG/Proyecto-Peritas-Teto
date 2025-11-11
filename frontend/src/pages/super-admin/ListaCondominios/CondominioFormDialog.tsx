// CondominioFormDialog.tsx
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CondominioFormData, ValidationErrors } from "./types";

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {mode === 'create' ? 'Añadir Condominio' : 'Editar Condominio'}
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 pt-2">
            {mode === 'create' 
              ? 'Completa la información del nuevo condominio'
              : `Modifica la información del condominio "${condominioName}"`
            }
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Nombre *
            </label>
            <Input
              placeholder="Ej: Condominio Las Flores"
              value={formData.nombre}
              onChange={(e) => {
                onFormChange({ nombre: e.target.value });
                if (validationErrors.nombre) {
                  onValidationErrorClear('nombre');
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
              value={formData.direccion}
              onChange={(e) => {
                onFormChange({ direccion: e.target.value });
                if (validationErrors.direccion) {
                  onValidationErrorClear('direccion');
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
              value={formData.total_viviendas || ''}
              onChange={(e) => onFormChange({ total_viviendas: parseInt(e.target.value) || 0 })}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {mode === 'create' ? 'Ingresos Iniciales' : 'Ingresos'}
            </label>
            <Input
              type="number"
              placeholder="Ej: 0"
              value={formData.ingresos || ''}
              onChange={(e) => onFormChange({ ingresos: parseFloat(e.target.value) || 0 })}
              className="w-full"
            />
            {mode === 'create' && (
              <p className="text-xs text-gray-500 mt-1">Deja en 0 para comenzar sin ingresos</p>
            )}
          </div>
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={onSubmit}
            disabled={submitting || !isFormValid}
            className="w-full bg-[#99D050] hover:bg-[#88bf40] text-white font-medium"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {mode === 'create' ? 'Creando...' : 'Actualizando...'}
              </>
            ) : (
              mode === 'create' ? 'Crear Condominio' : 'Guardar Cambios'
            )}
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full"
            disabled={submitting}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
