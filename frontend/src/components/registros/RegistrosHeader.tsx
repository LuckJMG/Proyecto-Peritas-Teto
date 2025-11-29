import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  all: "Todos los tipos",
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
    <div className="mb-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Libro de Registros</h1>
        <p className="text-gray-500">
          En esta sección se encuentran todos los detalles de todo
        </p>
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-80">
            <Input
              type="text"
              placeholder="Nombre/Apellido"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="h-10 rounded-lg border-gray-300 bg-white pl-4 pr-10 text-sm text-gray-700 placeholder:text-gray-400"
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>

          <select
            value={tipoFiltro}
            onChange={(e) => setTipoFiltro(e.target.value as TipoEvento | "all")}
            className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700"
          >
            {TIPOS_EVENTO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {TIPO_LABELS[tipo]}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={onAddClick}
          className="bg-[#99D050] font-medium text-white hover:bg-[#88bf40]"
        >
          <Plus className="mr-2 h-4 w-4" />
          Ingresar evento
        </Button>
      </div>
    </div>
  );
}