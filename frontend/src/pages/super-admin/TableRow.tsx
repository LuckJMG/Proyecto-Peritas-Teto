import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Building2, CalendarDays, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TableRow as UiTableRow, TableCell } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Condominio } from "@/types/condominio.types";

interface TableRowProps {
  condominio: Condominio;
  index: number;
  onEdit: (condominio: Condominio) => void;
  onDelete: (condominio: Condominio) => void;
  onViewEspacios: (condominio: Condominio) => void;
}

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-CL', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export default function TableRow({ condominio, onEdit, onDelete, onViewEspacios }: TableRowProps) {
  const navigate = useNavigate();
  const isInactive = !condominio.activo;

  const handleRowClick = () => {
    navigate(`/admin/dashboard`);
  };

  return (
    <UiTableRow 
      onClick={handleRowClick}
      className={`cursor-pointer transition-all duration-200 ${
        isInactive 
          ? "bg-muted/40 hover:bg-muted/60 opacity-70 grayscale-[0.8]" 
          : "hover:bg-muted/50"
      }`}
    >
      <TableCell className="font-medium text-center">
        <div className="flex items-center justify-center gap-2">
          {condominio.nombre}
          {isInactive && (
            <span className="text-[10px] font-normal px-1.5 py-0.5 rounded-full bg-gray-200 text-gray-600 border border-gray-300">
              Inactivo
            </span>
          )}
        </div>
      </TableCell>
      
      <TableCell className="text-center text-muted-foreground">
        {condominio.direccion}
      </TableCell>
      
      <TableCell className="text-center">
        <Badge 
          variant="outline" 
          className={`${
            condominio.ingresos < 0 
              ? "bg-red-50 text-red-700 border-red-200" 
              : "bg-green-50 text-green-700 border-green-200"
          }`}
        >
          {formatCurrency(condominio.ingresos)}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span>{formatDate(condominio.fecha_creacion)}</span>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center justify-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(condominio);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar Condominio</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-blue-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewEspacios(condominio);
                  }}
                >
                  <Building2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Gestionar Espacios Comunes</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className={`h-8 w-8 ${
                    isInactive 
                      ? "text-muted-foreground hover:text-green-600 hover:bg-green-50" 
                      : "text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(condominio);
                  }}
                >
                  {isInactive ? (
                    <Power className="h-4 w-4" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isInactive ? "Habilitar Condominio" : "Deshabilitar Condominio"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </UiTableRow>
  );
}
