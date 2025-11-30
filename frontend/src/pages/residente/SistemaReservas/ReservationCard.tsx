import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ReservationView } from "./types";

interface ReservationCardProps {
  item: ReservationView;
  onDelete?: (id: string) => void;
}

export function ReservationCard({ item, onDelete }: ReservationCardProps) {
  return (
    <div className="flex flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden h-[72px] transition-all hover:shadow-md group">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#99D050]" />
      
      <div className="ml-3 flex flex-col justify-center grow">
        <h3 className="text-lg font-medium text-gray-900">{item.type}</h3>
        <span className="text-sm text-gray-500 font-light capitalize">
          {item.timeRange}
        </span>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-lg font-semibold text-gray-900">
          ${item.price.toLocaleString("es-CL")}
        </div>
        
        {/* Delete Action - Only visible if handler provided */}
        {onDelete && (
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
