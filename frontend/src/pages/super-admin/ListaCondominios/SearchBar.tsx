// SearchBar.tsx
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
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="relative w-80">
        <Input
          type="text"
          placeholder="Buscar condominio..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-4 pr-10 bg-white border-gray-300 rounded-full h-12 text-gray-700 placeholder:text-gray-400"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <div className="w-px h-6 bg-gray-300"></div>
          <Search className="h-5 w-5 text-gray-600" />
        </div>
      </div>
      <Button
        onClick={onAddClick}
        className="bg-[#99D050] hover:bg-[#88bf40] text-white font-medium"
      >
        <Home className="h-4 w-4 mr-2" />
        Añadir Condominio
      </Button>
    </div>
  );
}
