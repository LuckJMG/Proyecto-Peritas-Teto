import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronRight,  
  Clock, 
  Hammer, 
  Volume2, 
  PawPrint,
  FileText
} from "lucide-react";
import type { Multa } from "@/services/multaService";

interface MultaCardProps {
  multa: Multa;
  onClick: (multa: Multa) => void;
}

export function MultaCard({ multa, onClick }: MultaCardProps) {
  
  // Helper para íconos según tipo
  const getIcon = (tipo: string) => {
    switch (tipo) {
      case "RETRASO_PAGO": return <Clock className="w-5 h-5 text-orange-500" />;
      case "RUIDO": return <Volume2 className="w-5 h-5 text-purple-500" />;
      case "INFRAESTRUCTURA": return <Hammer className="w-5 h-5 text-slate-500" />;
      case "MASCOTA": return <PawPrint className="w-5 h-5 text-amber-600" />;
      default: return <FileText className="w-5 h-5 text-blue-500" />;
    }
  };

  // Helper para formato de estado
  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "PAGADA":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Pagada</Badge>;
      case "CONDONADA":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Condonada</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">Pendiente</Badge>;
    }
  };

  // Formatear tipo para mostrar (eliminar guiones bajos y capitalizar)
  const formatTipo = (tipo: string) => {
    const text = tipo.replace(/_/g, " ").toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-gray-200 group flex flex-col h-full overflow-hidden rounded-xl">
      {/* Indicador lateral de estado */}
      <div className={`h-1 w-full ${multa.estado === 'PENDIENTE' ? 'bg-red-500' : 'bg-green-500'}`} />
      
      <CardHeader className="pb-3 pt-4 flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            {getIcon(multa.tipo)}
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{formatTipo(multa.tipo)}</h3>
            <p className="text-xs text-gray-500">
              {multa.fecha_emision ? new Date(multa.fecha_emision).toLocaleDateString("es-CL") : "Fecha desconocida"}
            </p>
          </div>
        </div>
        {getStatusBadge(multa.estado)}
      </CardHeader>
      
      <CardContent className="flex-1 pb-4">
        <div className="mb-4">
          <p className="text-2xl font-bold text-gray-900">
            ${multa.monto.toLocaleString("es-CL")}
          </p>
          <p className="text-sm text-gray-600 line-clamp-2 mt-1 leading-relaxed">
            {multa.descripcion}
          </p>
        </div>

        <Button 
          variant="ghost" 
          className="w-full justify-between text-[#99D050] hover:text-[#8bc040] hover:bg-transparent p-0 font-medium h-auto"
          onClick={() => onClick(multa)}
        >
          Ver detalles
          <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
