import { Search, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Condominio } from "@/services/condominioService";

interface UsuarioFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  condominioFiltro: number | "all";
  onCondominioChange: (val: number | "all") => void;
  condominios: Condominio[];
  onAddClick: () => void;
}

export function UsuarioFilters({
  searchTerm,
  onSearchChange,
  onAddClick,
}: UsuarioFiltersProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="relative w-80">
          <Input
            type="text"
            placeholder="Nombre / Apellido / Email"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-12 rounded-full border-gray-300 bg-white pl-4 pr-10 text-gray-700 placeholder:text-gray-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <div className="h-6 w-px bg-gray-300" />
            <Search className="h-5 w-5 text-gray-600" />
          </div>
        </div>
      </div>

      <Button
        onClick={onAddClick}
        className="bg-[#99D050] font-medium text-white hover:bg-[#88bf40]"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Añadir Residente
      </Button>
    </div>
  );
}
