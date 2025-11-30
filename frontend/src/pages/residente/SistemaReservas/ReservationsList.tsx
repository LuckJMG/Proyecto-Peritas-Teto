import { ReservationCard } from "./ReservationCard";
import type { DateGroup } from "./types";

interface ReservationsListProps {
  groups: DateGroup[];
  emptyMessage: string;
  onDelete?: (id: string) => void;
}

export function ReservationsList({ groups, emptyMessage, onDelete }: ReservationsListProps) {
  if (groups.length === 0) {
    return <p className="text-gray-400 text-center py-4">{emptyMessage}</p>;
  }

  return (
    <div className="flex flex-col gap-6 mt-2">
      {groups.map((group, idx) => (
        <div key={idx} className="flex flex-col gap-3">
          <h4 className="text-sm font-semibold text-gray-800 ml-1">
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
