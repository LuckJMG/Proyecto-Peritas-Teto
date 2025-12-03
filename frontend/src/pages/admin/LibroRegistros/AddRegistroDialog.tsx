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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
            Registra una nueva acción en el sistema manualmente.
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
            <Select
              value={formData.tipo_evento}
              onValueChange={(val) => setFormData({ ...formData, tipo_evento: val as TipoEvento })}
            >
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecciona un tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_EVENTO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {TIPO_LABELS[tipo]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="detalle">Detalle</Label>
            <Input
              id="detalle"
              placeholder="Ej: Mantenimiento piscina"
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
              placeholder="$0"
              value={formData.monto}
              onChange={(e) =>
                setFormData({ ...formData, monto: e.target.value })
              }
            />
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
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#99D050] hover:bg-[#88bf40] text-white"
          >
            {submitting ? "Creando..." : "Crear Registro"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
