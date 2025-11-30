import type { ReservationView } from "./types";

interface ReservationCardProps {
  item: ReservationView;
}

export function ReservationCard({ item }: ReservationCardProps) {
  return (
    <div className="flex flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden h-[72px] transition-shadow hover:shadow-md">
      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#99D050]" />
      <div className="ml-3 flex flex-col justify-center">
        <h3 className="text-lg font-medium text-gray-900">{item.type}</h3>
        <span className="text-sm text-gray-500 font-light capitalize">
          {item.timeRange}
        </span>
      </div>
      <div className="text-lg font-semibold text-gray-900">
        ${item.price.toLocaleString("es-CL")}
      </div>
    </div>
  );
}
