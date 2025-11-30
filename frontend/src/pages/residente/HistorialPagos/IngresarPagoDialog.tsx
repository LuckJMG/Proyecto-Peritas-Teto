import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authService } from "@/services/authService";
import { deudaService, type DeudaPendiente } from "@/services/deudaService";
import { pagoService, type MetodoPago } from "@/services/pagoService";
import { Loader2 } from "lucide-react";

interface IngresarPagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function IngresarPagoDialog({ open, onOpenChange, onSuccess }: IngresarPagoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [deudas, setDeudas] = useState<DeudaPendiente[]>([]);
  const [selectedDeudaId, setSelectedDeudaId] = useState<string>("");
  const [numeroTransaccion, setNumeroTransaccion] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("TRANSFERENCIA");

  // Cargar deudas al abrir el modal
  useEffect(() => {
    if (open) {
      const user = authService.getUser();
      if (user) {
        deudaService.getPendientes(user.id).then(setDeudas);
      }
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!selectedDeudaId) return;
    
    try {
      setLoading(true);
      const user = authService.getUser();
      const deuda = deudas.find(d => d.id.toString() === selectedDeudaId.split('-')[1]);
      
      if (!user || !deuda) return;

      await pagoService.create({
        condominio_id: user.condominio_id || 1, // Fallback si no tiene condominio
        residente_id: user.id,
        tipo: deuda.tipo,
        referencia_id: deuda.id,
        monto: deuda.monto,
        metodo_pago: metodoPago,
        numero_transaccion: numeroTransaccion,
        detalle: `Pago manual de ${deuda.descripcion}`
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const selectedDeuda = deudas.find(d => `${d.tipo}-${d.id}` === selectedDeudaId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Informar Nuevo Pago</DialogTitle>
          <DialogDescription>
            Selecciona la deuda que deseas pagar e ingresa los detalles de la transferencia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>¿Qué estás pagando?</Label>
            <Select onValueChange={setSelectedDeudaId} value={selectedDeudaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una deuda pendiente" />
              </SelectTrigger>
              <SelectContent>
                {deudas.length === 0 ? (
                  <div className="p-2 text-sm text-gray-500 text-center">¡Estás al día! No tienes deudas pendientes.</div>
                ) : (
                  deudas.map((deuda) => (
                    <SelectItem key={`${deuda.tipo}-${deuda.id}`} value={`${deuda.tipo}-${deuda.id}`}>
                      {deuda.descripcion} - ${deuda.monto.toLocaleString('es-CL')}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedDeuda && (
            <div className="p-3 bg-gray-50 rounded-md border border-gray-100 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-500">Monto a pagar:</span>
                <span className="font-bold text-gray-900">${selectedDeuda.monto.toLocaleString('es-CL')}</span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Método</Label>
              <Select onValueChange={(v) => setMetodoPago(v as MetodoPago)} value={metodoPago}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRANSFERENCIA">Transferencia</SelectItem>
                  <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                  <SelectItem value="OTRO">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>N° Operación / Transacción</Label>
              <Input 
                placeholder="Ej: 12345678" 
                value={numeroTransaccion}
                onChange={(e) => setNumeroTransaccion(e.target.value)}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !selectedDeudaId}
            className="bg-[#99D050] hover:bg-[#88bf40]"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Registrar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}