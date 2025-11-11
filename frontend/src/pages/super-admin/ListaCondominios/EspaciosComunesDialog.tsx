// EspaciosComunesDialog.tsx
import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Building2, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { espaciosComunesService } from "@/services/espaciosComunesService";
import type { EspacioComun } from "@/services/espaciosComunesService";
import type { Condominio } from "./types";

interface EspaciosComunesDialogProps {
  open: boolean;
  condominio: Condominio | null;
  onOpenChange: (open: boolean) => void;
}

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

export default function EspaciosComunesDialog({
  open,
  condominio,
  onOpenChange,
}: EspaciosComunesDialogProps) {
  const [espacios, setEspacios] = useState<EspacioComun[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && condominio?.id) {
      loadEspaciosComunes();
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

  const formatCurrency = (value: number | null): string => {
    if (value === null || value === 0) return "Gratis";
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Building2 className="h-5 w-5 text-[#99D050]" />
            Espacios Comunes
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 pt-2">
            Espacios disponibles en {condominio?.nombre}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
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
                Este condominio aún no tiene espacios comunes asignados
              </p>
            </div>
          ) : (
            <div className="space-y-3">
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
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      espacio.activo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {espacio.activo ? 'Activo' : 'Inactivo'}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Capacidad: <strong>{espacio.capacidad}</strong></span>
                    </div>
                    
                    {espacio.requierePago && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>
                          {formatCurrency(espacio.costoPorHora)}
                          {espacio.costoPorHora && espacio.costoPorHora > 0 && '/hora'}
                        </span>
                      </div>
                    )}
                    
                    {!espacio.requierePago && (
                      <div className="flex items-center gap-2 text-green-700">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Uso gratuito</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
