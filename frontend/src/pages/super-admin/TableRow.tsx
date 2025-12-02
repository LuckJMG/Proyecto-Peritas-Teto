import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Building2, CalendarDays } from "lucide-react";
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

  const handleRowClick = () => {
    // Navega al dashboard del condominio seleccionado
    navigate(`/admin/dashboard/${condominio.id}`);
  };

  return (
    <UiTableRow 
      onClick={handleRowClick}
      className="cursor-pointer hover:bg-muted/50 transition-colors"
    >
      <TableCell className="font-medium text-center">
        {condominio.nombre}
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
                  className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(condominio);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Deshabilitar Condominio</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </TableCell>
    </UiTableRow>
  );
}
