import { Check, X, Calendar, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useRegistroAutomatico } from "@/services/registroService";
import type { ReservaAdminView } from "@/hooks/useReservasAdmin";

interface PendingRequestsProps {
  reservas: ReservaAdminView[];
  onAction: (id: number, action: "CONFIRMADA" | "CANCELADA") => void;
}

export function PendingRequests({ reservas, onAction }: PendingRequestsProps) {
  // 2. INICIALIZAR EL HOOK
  const { registrar } = useRegistroAutomatico();

  const pendientes = reservas.filter(
    (r) => r.estado === "PENDIENTE" || r.estado === "PENDIENTE_PAGO"
  );

  // 3. MANEJADOR INTERNO PARA INTERCEPTAR Y REGISTRAR
  const handleDecision = async (reserva: ReservaAdminView, action: "CONFIRMADA" | "CANCELADA") => {
    // Obtenemos el usuario actual para sacar el condominio_id (para el log)
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : {};

    // Preparamos el mensaje del log
    const accionTexto = action === "CONFIRMADA" ? "Aceptó" : "Rechazó";
    const detalle = `Admin ${accionTexto} solicitud de reserva #${reserva.id} para ${reserva.nombreEspacio} (Residente: ${reserva.nombreResidente})`;

    // Registramos la acción (Fire and forget, no bloqueamos la UI)
    registrar("RESERVA", detalle, {
      condominio_id: user.condominio_id
    });

    // Ejecutamos la acción original que actualiza la BD y recarga la tabla
    onAction(reserva.id, action);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-bold text-gray-900">Solicitudes Pendientes</h2>
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          {pendientes.length} nuevas
        </Badge>
      </div>

      <div className="flex flex-col gap-3">
        {pendientes.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <p className="text-gray-400 text-sm">No hay solicitudes pendientes</p>
          </div>
        ) : (
          pendientes.map((reserva) => (
            <Card key={reserva.id} className="relative shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
              {/* Barra lateral amarilla contenida */}
              <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-yellow-400 z-10" />
              <CardContent className="p-4 pl-5">
                {/* Header */}
                <div className="flex justify-between items-start mb-2 pl-2">
                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{reserva.nombreEspacio}</h3>
                  {reserva.monto_pago && reserva.monto_pago > 0 && (
                    <span className="text-[10px] font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-600 whitespace-nowrap">
                      ${reserva.monto_pago.toLocaleString("es-CL")}
                    </span>
                  )}
                </div>

                {/* Detalles */}
                <div className="space-y-1.5 mb-4 pl-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate font-medium">{reserva.nombreResidente}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>
                      {new Date(reserva.fecha_reserva).toLocaleDateString("es-CL", {
                        day: "numeric", month: "long"
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span>
                      {reserva.hora_inicio.substring(0, 5)} - {reserva.hora_fin.substring(0, 5)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pl-2">
                  <Button
                    onClick={() => handleDecision(reserva, "CONFIRMADA")}
                    className="flex-1 bg-[#99D050] hover:bg-[#8bc040] text-white h-8 text-xs font-semibold shadow-sm"
                  >
                    <Check className="w-3 h-3 mr-1.5" />
                    Aceptar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleDecision(reserva, "CANCELADA")}
                    className="flex-1 border-gray-200 text-gray-600 hover:text-red-600 hover:bg-red-50 h-8 text-xs shadow-sm"
                  >
                    <X className="w-3 h-3 mr-1.5" />
                    Rechazar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
