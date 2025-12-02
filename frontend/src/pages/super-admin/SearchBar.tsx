import { Search, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddClick: () => void;
}

export default function SearchBar({ searchTerm, onSearchChange, onAddClick }: SearchBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar condominio..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-white"
        />
      </div>
      <Button
        onClick={onAddClick}
        className="w-full sm:w-auto bg-[#99D050] hover:bg-[#88bf40] text-white font-medium"
      >
        <Home className="h-4 w-4 mr-2" />
        Añadir Condominio
      </Button>
    </div>
  );
}
