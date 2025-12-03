import type { Registro } from "@/services/registroService";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface RegistrosTableProps {
  registros: Registro[];
}

const TIPO_LABELS: Record<string, string> = {
  RESERVA: "Reserva",
  ANUNCIO: "Anuncio",
  MULTA: "Multa",
  PAGO: "Pago",
  EDICION: "Edición",
  ELIMINACION: "Eliminación",
  CREACION: "Creación",
  OTRO: "Otro",
};

export function RegistrosTable({ registros }: RegistrosTableProps) {
  const formatMonto = (monto?: number) => {
    if (!monto) return "-";
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(monto);
  };

  const getInitials = (nombre?: string, apellido?: string) => {
    if (!nombre || !apellido) return "??";
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-CL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-md border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead>Usuario</TableHead>
            <TableHead className="text-center">Tipo</TableHead>
            <TableHead className="w-[40%]">Detalle</TableHead>
            <TableHead className="text-right">Monto</TableHead>
            <TableHead className="text-right">Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registros.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                No se encontraron registros
              </TableCell>
            </TableRow>
          ) : (
            registros.map((registro) => (
              <TableRow key={registro.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                      {getInitials(registro.usuario_nombre, registro.usuario_apellido)}
                    </div>
                    <span className="text-sm font-medium">
                      {registro.usuario_nombre} {registro.usuario_apellido}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="font-normal">
                    {TIPO_LABELS[registro.tipo_evento] || registro.tipo_evento}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {registro.detalle}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatMonto(registro.monto)}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatDate(registro.fecha_creacion)}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
