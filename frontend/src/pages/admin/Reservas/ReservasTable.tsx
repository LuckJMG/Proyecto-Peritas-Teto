import { MoreHorizontal, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { ReservaAdminView } from "@/hooks/useReservasAdmin";

interface ReservasTableProps {
  reservas: ReservaAdminView[];
  onUpdateStatus: (id: number, status: string) => void;
}

export function ReservasTable({ reservas, onUpdateStatus }: ReservasTableProps) {
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMADA":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-0 font-medium px-3 py-1">
            Confirmada
          </Badge>
        );
      case "PENDIENTE_PAGO":
      case "PENDIENTE":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-0 font-medium px-3 py-1">
            Pendiente
          </Badge>
        );
      case "CANCELADA":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-0 font-medium px-3 py-1">
            Rechazada
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatTime = (time: string) => time.substring(0, 5);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[280px] py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Residente
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Servicio
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Fecha
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Horario
            </TableHead>
            <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Estado
            </TableHead>
            <TableHead className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider pr-6">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-gray-500">
                No se encontraron reservas.
              </TableCell>
            </TableRow>
          ) : (
            reservas.map((reserva) => (
              <TableRow key={reserva.id} className="hover:bg-gray-50/50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 bg-gray-100 border border-gray-200">
                      <AvatarFallback className="text-gray-600 text-sm font-semibold bg-gray-100">
                        {reserva.nombreResidente.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-900 text-sm">
                        {reserva.nombreResidente}
                      </span>
                      <span className="text-xs text-gray-500 font-light">
                        Residente
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium text-gray-700 text-sm">
                  {reserva.nombreEspacio}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {new Date(reserva.fecha_reserva).toLocaleDateString("es-CL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell className="text-sm text-gray-600">
                  {formatTime(reserva.hora_inicio)} - {formatTime(reserva.hora_fin)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(reserva.estado)}
                </TableCell>
                <TableCell className="text-right pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      {(reserva.estado === "PENDIENTE" || reserva.estado === "PENDIENTE_PAGO") && (
                        <>
                          <DropdownMenuItem
                            onClick={() => onUpdateStatus(reserva.id, "CONFIRMADA")}
                            className="text-green-600 focus:text-green-700 focus:bg-green-50 cursor-pointer"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Aprobar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onUpdateStatus(reserva.id, "CANCELADA")}
                            className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Rechazar
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                            if(confirm("¿Estás seguro de eliminar esta reserva?")) {
                                onUpdateStatus(reserva.id, "DELETE"); 
                            }
                        }}
                        className="text-gray-600 focus:bg-gray-100 cursor-pointer mt-1 border-t border-gray-100"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
