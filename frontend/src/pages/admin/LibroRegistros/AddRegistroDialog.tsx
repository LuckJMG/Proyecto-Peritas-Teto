import { useState } from "react";
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
import { registroService, type TipoEvento } from "@/services/registroService";
import { authService } from "@/services/authService";

const TIPOS_EVENTO: TipoEvento[] = [
  "RESERVA",
  "ANUNCIO",
  "MULTA",
  "PAGO",
  "EDICION",
  "ELIMINACION",
  "CREACION",
  "OTRO",
];

const TIPO_LABELS: Record<TipoEvento, string> = {
  RESERVA: "Reserva",
  ANUNCIO: "Anuncio",
  MULTA: "Multa",
  PAGO: "Pago",
  EDICION: "Edición",
  ELIMINACION: "Eliminación",
  CREACION: "Creación",
  OTRO: "Otro",
};

interface AddRegistroDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddRegistroDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddRegistroDialogProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    tipo_evento: "RESERVA" as TipoEvento,
    detalle: "",
    monto: "",
  });

  const handleSubmit = async () => {
    if (!formData.detalle.trim()) {
      setError("El detalle es obligatorio");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const user = authService.getUser();
      if (!user) {
        setError("No hay usuario autenticado");
        return;
      }

      await registroService.create({
        usuario_id: user.id,
        tipo_evento: formData.tipo_evento,
        detalle: formData.detalle,
        monto: formData.monto ? parseFloat(formData.monto) : undefined,
      });

      // Reset form
      setFormData({
        tipo_evento: "RESERVA",
        detalle: "",
        monto: "",
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      setError("Error al crear registro");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ingresar evento</DialogTitle>
          <DialogDescription>
            Registra una nueva acción en el sistema
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tipo">Tipo de evento</Label>
            <select
              id="tipo"
              value={formData.tipo_evento}
              onChange={(e) =>
                setFormData({ ...formData, tipo_evento: e.target.value as TipoEvento })
              }
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm"
            >
              {TIPOS_EVENTO.map((tipo) => (
                <option key={tipo} value={tipo}>
                  {TIPO_LABELS[tipo]}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="detalle">Detalle</Label>
            <Input
              id="detalle"
              placeholder="Ej: Piscina"
              value={formData.detalle}
              onChange={(e) =>
                setFormData({ ...formData, detalle: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto (opcional)</Label>
            <Input
              id="monto"
              type="number"
              placeholder="$20,000"
              value={formData.monto}
              onChange={(e) =>
                setFormData({ ...formData, monto: e.target.value })
              }
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-[#99D050] hover:bg-[#88bf40] text-white font-medium"
          >
            {submitting ? "Creando..." : "Crear Registro"}
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