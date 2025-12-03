import { ReservationCard } from "./ReservationCard";
import type { DateGroup } from "@/types/reserva.types";
import { CalendarX2 } from "lucide-react";

interface ReservationsListProps {
  groups: DateGroup[];
  emptyMessage: string;
  onDelete?: (id: string) => void;
}

export function ReservationsList({ groups, emptyMessage, onDelete }: ReservationsListProps) {
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
        <div className="bg-gray-100 p-3 rounded-full mb-3">
          <CalendarX2 className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-gray-500 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-2">
      {groups.map((group, idx) => (
        <div key={idx} className="flex flex-col gap-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider pl-1">
            {group.date}
          </h4>
          <div className="flex flex-col gap-3">
            {group.items.map((item) => (
              <ReservationCard 
                key={item.id} 
                item={item} 
                onDelete={onDelete} 
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
