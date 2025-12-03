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
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="relative w-full sm:w-80">
        <Input
          type="text"
          placeholder="Nombre / Apellido / Email"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-white"
        />
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      </div>

      <Button
        onClick={onAddClick}
        className="bg-[#99D050] font-medium text-white hover:bg-[#88bf40] w-full sm:w-auto"
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Añadir Residente
      </Button>
    </div>
  );
}
