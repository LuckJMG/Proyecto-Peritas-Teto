// CondominiosTable.tsx
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import TableRow from "./TableRow";
import type { Condominio, SortConfig } from "./types";

interface CondominiosTableProps {
  condominios: Condominio[];
  sortConfig: SortConfig;
  onSort: (key: keyof Condominio) => void;
  onEdit: (condominio: Condominio) => void;
  onDelete: (condominio: Condominio) => void;
}

export default function CondominiosTable({ 
  condominios, 
  sortConfig, 
  onSort,
  onEdit,
  onDelete 
}: CondominiosTableProps) {
  const getSortIcon = (key: keyof Condominio) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="h-3 w-3" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-3 w-3" /> 
      : <ArrowDown className="h-3 w-3" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-[#e5e5e5] border-b border-gray-300">
          <tr>
            <th className="px-4 py-2 text-center">
              <button
                onClick={() => onSort('nombre')}
                className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 mx-auto"
              >
                Nombre del condominio
                {getSortIcon('nombre')}
              </button>
            </th>
            <th className="px-4 py-2 text-center">
              <button
                onClick={() => onSort('direccion')}
                className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 mx-auto"
              >
                Dirección
                {getSortIcon('direccion')}
              </button>
            </th>
            <th className="px-4 py-2 text-center">
              <button
                onClick={() => onSort('ingresos')}
                className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 mx-auto"
              >
                Ingresos
                {getSortIcon('ingresos')}
              </button>
            </th>
            <th className="px-4 py-2 text-center">
              <button
                onClick={() => onSort('fecha_creacion')}
                className="flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900 mx-auto"
              >
                Fecha de creación
                {getSortIcon('fecha_creacion')}
              </button>
            </th>
            <th className="px-4 py-2 text-center">
              <button className="flex items-center gap-2 text-xs font-semibold text-gray-700 mx-auto">
                Acciones
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {condominios.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No se encontraron condominios
              </td>
            </tr>
          ) : (
            condominios.map((condo, index) => (
              <TableRow
                key={condo.id}
                condominio={condo}
                index={index}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
