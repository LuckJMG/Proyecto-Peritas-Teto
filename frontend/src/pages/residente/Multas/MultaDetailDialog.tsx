import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Calendar, CheckCircle2, DollarSign } from "lucide-react";
import type { Multa } from "@/services/multaService";
import { Link } from "react-router-dom";

interface MultaDetailDialogProps {
  multa: Multa | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MultaDetailDialog({ multa, open, onOpenChange }: MultaDetailDialogProps) {
  if (!multa) return null;

  const isPending = multa.estado === "PENDIENTE";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            {isPending ? (
              <AlertTriangle className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            <span className={`text-sm font-bold ${isPending ? 'text-red-600' : 'text-green-600'}`}>
              ESTADO: {multa.estado}
            </span>
          </div>
          <DialogTitle className="text-xl text-gray-900">
            Detalle de Infracción #{multa.id}
          </DialogTitle>
          <DialogDescription>
            {multa.tipo.replace(/_/g, " ")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200/60">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Fecha Emisión
              </span>
              <span className="font-medium text-gray-900">
                {multa.fecha_emision ? new Date(multa.fecha_emision).toLocaleDateString() : "-"}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> Monto Multa
              </span>
              <span className="font-bold text-lg text-gray-900">
                ${multa.monto.toLocaleString("es-CL")}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-700">Descripción del evento</h4>
            <p className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
              {multa.descripcion}
            </p>
          </div>

          {multa.estado === "CONDONADA" && multa.motivo_condonacion && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-blue-700">Motivo Condonación</h4>
              <p className="text-sm text-blue-600 bg-blue-50 p-3 rounded border border-blue-100">
                {multa.motivo_condonacion}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
          {isPending && (
            <Link to="/resumen" className="w-full sm:w-auto">
              <Button className="w-full bg-[#99D050] hover:bg-[#8bc040] text-black font-medium">
                Ir a Pagar
              </Button>
            </Link>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}