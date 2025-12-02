import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { authService } from "@/services/authService";
import { deudaService, type DeudaPendiente } from "@/services/deudaService";
import { pagoService, type MetodoPago } from "@/services/pagoService";
import { Loader2, AlertCircle } from "lucide-react";

interface IngresarPagoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function IngresarPagoDialog({ open, onOpenChange, onSuccess }: IngresarPagoDialogProps) {
  const [loading, setLoading] = useState(false);
  const [loadingDeudas, setLoadingDeudas] = useState(false);
  const [deudas, setDeudas] = useState<DeudaPendiente[]>([]);
  const [selectedDeudaId, setSelectedDeudaId] = useState<string>("");
  const [numeroTransaccion, setNumeroTransaccion] = useState("");
  const [metodoPago, setMetodoPago] = useState<MetodoPago>("TRANSFERENCIA");
  const [error, setError] = useState<string | null>(null);

  // Cargar deudas al abrir el modal
  useEffect(() => {
    if (open) {
      cargarDeudas();
    }
  }, [open]);

  const cargarDeudas = async () => {
    try {
      setLoadingDeudas(true);
      setError(null);
      const user = authService.getUser();
      
      if (!user) {
        setError("No se encontró información del usuario");
        return;
      }

      const deudasData = await deudaService.getPendientes(user.id);
      setDeudas(deudasData);
    } catch (err) {
      console.error("Error cargando deudas:", err);
      setError("No se pudieron cargar las deudas pendientes");
    } finally {
      setLoadingDeudas(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDeudaId) {
      setError("Debes seleccionar una deuda");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const user = authService.getUser();
      const deuda = deudas.find(d => `${d.tipo}-${d.id}` === selectedDeudaId);
      
      if (!user || !deuda) {
        setError("No se encontró la información necesaria");
        return;
      }

      await pagoService.create({
        condominio_id: user.condominio_id || 1,
        residente_id: undefined,
        tipo: deuda.tipo,
        referencia_id: deuda.id,
        monto: deuda.monto,
        metodo_pago: metodoPago,
        numero_transaccion: numeroTransaccion || undefined,
        detalle: `Pago manual: ${deuda.descripcion}`
      });

      // Resetear el formulario
      setSelectedDeudaId("");
      setNumeroTransaccion("");
      setMetodoPago("TRANSFERENCIA");
      
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error al registrar pago:", error);
      setError(error.message || "No se pudo registrar el pago");
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
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2 text-sm text-red-800">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label>¿Qué estás pagando?</Label>
            {loadingDeudas ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                <span className="ml-2 text-sm text-gray-500">Cargando deudas...</span>
              </div>
            ) : (
              <Select onValueChange={setSelectedDeudaId} value={selectedDeudaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una deuda pendiente" />
                </SelectTrigger>
                <SelectContent>
                  {deudas.length === 0 ? (
                    <div className="p-4 text-sm text-gray-500 text-center">
                      <p className="font-medium mb-1">¡Estás al día!</p>
                      <p className="text-xs">No tienes deudas pendientes.</p>
                    </div>
                  ) : (
                    deudas.map((deuda) => (
                      <SelectItem key={`${deuda.tipo}-${deuda.id}`} value={`${deuda.tipo}-${deuda.id}`}>
                        <div className="flex justify-between items-center w-full">
                          <span>{deuda.descripcion}</span>
                          <span className="ml-4 font-bold">${deuda.monto.toLocaleString('es-CL')}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>

          {selectedDeuda && (
            <div className="p-4 bg-green-50 rounded-md border border-green-200 text-sm space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Concepto:</span>
                <span className="font-medium text-gray-900">{selectedDeuda.descripcion}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Monto a pagar:</span>
                <span className="font-bold text-lg text-green-700">${selectedDeuda.monto.toLocaleString('es-CL')}</span>
              </div>
              {selectedDeuda.fecha_vencimiento && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Vencimiento:</span>
                  <span className="text-gray-700">
                    {new Date(selectedDeuda.fecha_vencimiento).toLocaleDateString('es-CL')}
                  </span>
                </div>
              )}
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
                  <SelectItem value="TRANSFERENCIA">Transferencia Bancaria</SelectItem>
                  <SelectItem value="EFECTIVO">Efectivo (en oficina)</SelectItem>
                  <SelectItem value="TARJETA">Tarjeta de Débito/Crédito</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>N° Operación / Comprobante</Label>
              <Input 
                placeholder="Ingresa el número de transacción" 
                value={numeroTransaccion}
                onChange={(e) => setNumeroTransaccion(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">Opcional - Ayuda a verificar tu pago</p>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !selectedDeudaId || loadingDeudas}
            className="bg-[#99D050] hover:bg-[#88bf40]"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Informar Pago
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
