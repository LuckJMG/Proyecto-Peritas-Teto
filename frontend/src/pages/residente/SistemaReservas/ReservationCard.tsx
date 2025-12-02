import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReservationView } from "@/types/reserva.types";

interface ReservationCardProps {
  item: ReservationView;
  onDelete?: (id: string) => void;
}

export function ReservationCard({ item, onDelete }: ReservationCardProps) {
  
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "CONFIRMADA":
        return { bg: "bg-green-100", text: "text-green-700", label: "Confirmada" };
      case "PENDIENTE_PAGO":
      case "PENDIENTE":
        return { bg: "bg-yellow-100", text: "text-yellow-700", label: "Pendiente" };
      case "CANCELADA":
      case "RECHAZADA":
        return { bg: "bg-red-100", text: "text-red-700", label: "Rechazada" };
      case "COMPLETADA":
        return { bg: "bg-gray-100", text: "text-gray-700", label: "Completada" };
      default:
        return { bg: "bg-gray-100", text: "text-gray-700", label: status };
    }
  };

  const statusStyle = getStatusStyles(item.status);

  return (
    <div className="flex flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden h-20 transition-all hover:shadow-md group">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#99D050]" />
      
      <div className="ml-3 flex flex-col justify-center grow gap-1">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium text-gray-900 leading-none">{item.type}</h3>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusStyle.bg} ${statusStyle.text}`}>
            {statusStyle.label}
          </span>
        </div>
        <span className="text-sm text-gray-500 font-light capitalize leading-none">
          {item.timeRange}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-lg font-semibold text-gray-900">
          ${item.price.toLocaleString("es-CL")}
        </div>

        {/* Delete Action - Solo si se provee handler y NO está cancelada/rechazada */}
        {onDelete && item.status !== 'CANCELADA' && item.status !== 'RECHAZADA' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(item.id)}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
