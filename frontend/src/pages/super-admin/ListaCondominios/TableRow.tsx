// TableRow.tsx
import { Eye, Trash2, Edit, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Condominio } from "./types";

interface TableRowProps {
  condominio: Condominio;
  index: number;
  onEdit: (condominio: Condominio) => void;
  onDelete: (condominio: Condominio) => void;
}

const formatCurrency = (value: number): string => {
  if (value === 0) return "$0";
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getIngresosColor = (valor: number): string => {
  if (valor < 0) return "bg-[#e05959]";
  return "bg-[#bbd386]";
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function TableRow({ condominio, index, onEdit, onDelete }: TableRowProps) {
  return (
    <tr
      className={`${index % 2 === 0 ? 'bg-white' : 'bg-[#F3F3F3]'} hover:bg-gray-100 transition-colors border-b border-gray-200`}
    >
      <td className="px-4 py-4 text-sm text-gray-900 text-center">
        {condominio.nombre}
      </td>
      <td className="px-4 py-4 text-sm text-gray-700 text-center">
        {condominio.direccion}
      </td>
      <td className="px-4 py-4 text-center">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium text-white ${getIngresosColor(condominio.ingresos)}`}>
          <span className="text-xs">●</span>
          {formatCurrency(condominio.ingresos)}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2" />
            <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
            <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
            <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
          </svg>
          <span>{formatDate(condominio.fecha_creacion)}</span>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-[#404040] hover:bg-[#303030] text-white text-sm flex items-center gap-2">
                Administrar
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Ver condominio
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(condominio)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar condominio
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(condominio)}
                className="text-[#e05959]"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Deshabilitar condominio
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
}
