import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReservasFiltersProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: string;
  onStatusFilterChange: (val: string) => void;
}

export function ReservasFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: ReservasFiltersProps) {
  
  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case "ALL": return "Todos los estados";
      case "PENDIENTE": return "Pendiente";
      case "PENDIENTE_PAGO": return "Pendiente Pago";
      case "CONFIRMADA": return "Confirmada";
      case "CANCELADA": return "Rechazada";
      default: return filter;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-end sm:items-center">
      <div className="relative w-full sm:w-80">
        <Input
          placeholder="Buscar por residente o espacio..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-white border-gray-200 h-10 rounded-lg shadow-sm focus-visible:ring-[#99D050]"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 bg-white h-10 border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50">
            <Filter className="h-4 w-4" />
            {getFilterLabel(statusFilter)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onStatusFilterChange("ALL")}>
            Todos los estados
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusFilterChange("PENDIENTE")}>
            Pendiente
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusFilterChange("PENDIENTE_PAGO")}>
            Pendiente Pago
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusFilterChange("CONFIRMADA")}>
            Confirmada
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onStatusFilterChange("CANCELADA")}>
            Rechazada
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
