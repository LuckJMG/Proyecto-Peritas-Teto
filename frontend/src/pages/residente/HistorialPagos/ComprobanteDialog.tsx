import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { Pago } from "@/services/pagoService";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Printer, CheckCircle2 } from "lucide-react";

interface ComprobanteDialogProps {
  pago: Pago | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ComprobanteDialog({ pago, open, onOpenChange }: ComprobanteDialogProps) {
  if (!pago) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-xl">
        {/* Encabezado Visual */}
        <div className="bg-[#99D050] p-6 text-center print:bg-white print:text-black">
          <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm print:hidden">
            <CheckCircle2 className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1 print:text-black">Comprobante de Pago</h2>
          <p className="text-white/90 text-sm print:text-gray-600">Transacción Exitosa</p>
        </div>

        {/* Cuerpo del Comprobante */}
        <div className="p-6 space-y-6" id="printable-area">
          <div className="text-center border-b pb-6">
            <p className="text-sm text-gray-500 mb-1">Monto Pagado</p>
            <div className="text-4xl font-bold text-gray-900">
              ${pago.monto.toLocaleString('es-CL')}
            </div>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Fecha</span>
              <span className="font-medium text-gray-900">
                {format(new Date(pago.fecha_pago), "dd MMMM yyyy, HH:mm", { locale: es })}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Concepto</span>
              <span className="font-medium text-gray-900 capitalize">
                {pago.tipo.replace('_', ' ').toLowerCase()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Método de pago</span>
              <span className="font-medium text-gray-900 capitalize">
                {pago.metodo_pago.toLowerCase()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">N° Transacción</span>
              <span className="font-medium text-gray-900 font-mono">
                {pago.numero_transaccion || '---'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-500">Estado</span>
              <span className="font-bold text-[#99D050]">
                {pago.estado_pago}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg text-xs text-gray-500 text-center mt-6 print:border print:border-gray-200">
            <p>ID Referencia Pago: #{pago.id}</p>
            <p className="mt-1">Gracias por usar Peritas Teto</p>
          </div>
        </div>

        {/* Pie con Acciones (No se imprime) */}
        <div className="p-6 pt-2 flex gap-3 print:hidden">
          <Button variant="outline" className="flex-1" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button className="flex-1 bg-gray-900 text-white hover:bg-gray-800" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
