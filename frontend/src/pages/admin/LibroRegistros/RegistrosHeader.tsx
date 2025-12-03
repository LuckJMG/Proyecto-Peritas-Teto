import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TipoEvento } from "@/services/registroService";

const TIPOS_EVENTO: Array<TipoEvento | "all"> = [
  "all",
  "RESERVA",
  "ANUNCIO",
  "MULTA",
  "PAGO",
  "EDICION",
  "ELIMINACION",
  "CREACION",
  "OTRO",
];

const TIPO_LABELS: Record<TipoEvento | "all", string> = {
  all: "Todos los eventos",
  RESERVA: "Reserva",
  ANUNCIO: "Anuncio",
  MULTA: "Multa",
  PAGO: "Pago",
  EDICION: "Edición",
  ELIMINACION: "Eliminación",
  CREACION: "Creación",
  OTRO: "Otro",
};

interface RegistrosHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  tipoFiltro: TipoEvento | "all";
  setTipoFiltro: (tipo: TipoEvento | "all") => void;
  onAddClick: () => void;
  setPage: (page: number) => void;
}

export function RegistrosHeader({
  searchTerm,
  setSearchTerm,
  tipoFiltro,
  setTipoFiltro,
  onAddClick,
  setPage,
}: RegistrosHeaderProps) {
  return (
    <div className="flex flex-col gap-6 mb-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Libro de Registros</h1>
        <p className="text-muted-foreground">
          Historial completo de todas las acciones y eventos ocurridos en el sistema.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nombre o detalle..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="pl-9 bg-white"
            />
          </div>

          <div className="w-[180px]">
            <Select
              value={tipoFiltro}
              onValueChange={(val) => setTipoFiltro(val as TipoEvento | "all")}
            >
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Filtrar por tipo" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_EVENTO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {TIPO_LABELS[tipo]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={onAddClick}
          className="w-full sm:w-auto bg-[#99D050] hover:bg-[#88bf40] text-white font-medium"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ingresar evento
        </Button>
      </div>
    </div>
  );
}
