import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import TableRow from "./TableRow";
import type { Condominio, SortConfig } from "@/types/condominio.types";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow as UiTableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface CondominiosTableProps {
  condominios: Condominio[];
  sortConfig: SortConfig;
  onSort: (key: keyof Condominio) => void;
  onEdit: (condominio: Condominio) => void;
  onDelete: (condominio: Condominio) => void;
  onViewEspacios: (condominio: Condominio) => void;
}

export default function CondominiosTable({ 
  condominios, 
  sortConfig, 
  onSort,
  onEdit,
  onDelete,
  onViewEspacios
}: CondominiosTableProps) {
  const getSortIcon = (key: keyof Condominio) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4 text-primary" /> 
      : <ArrowDown className="ml-2 h-4 w-4 text-primary" />;
  };

  const renderSortButton = (label: string, key: keyof Condominio) => (
    <Button
      variant="ghost"
      onClick={() => onSort(key)}
      className="flex items-center justify-center w-full font-semibold hover:bg-transparent hover:text-primary p-0 h-auto"
    >
      {label}
      {getSortIcon(key)}
    </Button>
  );

  return (
    <div className="rounded-md border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <UiTableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="text-center w-[25%]">
              {renderSortButton("Nombre del condominio", "nombre")}
            </TableHead>
            <TableHead className="text-center w-[25%]">
              {renderSortButton("Dirección", "direccion")}
            </TableHead>
            <TableHead className="text-center w-[15%]">
              {renderSortButton("Ingresos", "ingresos")}
            </TableHead>
            <TableHead className="text-center w-[15%]">
              {renderSortButton("Fecha de creación", "fecha_creacion")}
            </TableHead>
            <TableHead className="text-center w-[20%] font-semibold text-foreground">
              Acciones
            </TableHead>
          </UiTableRow>
        </TableHeader>
        <TableBody>
          {condominios.length === 0 ? (
            <UiTableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No se encontraron condominios
              </TableCell>
            </UiTableRow>
          ) : (
            condominios.map((condo, index) => (
              <TableRow
                key={condo.id}
                condominio={condo}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewEspacios={onViewEspacios}
              />
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
