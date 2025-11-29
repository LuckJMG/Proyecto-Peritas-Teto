// src/components/registros/RegistrosTable.tsx
import type { Registro } from "@/services/registroService";

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
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <table className="w-full">
        <thead className="border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600">
              Nombre
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600">
              Tipo de evento
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600">
              Detalle
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600">
              Monto
            </th>
            <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600">
              Fecha
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {registros.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                No se encontraron registros
              </td>
            </tr>
          ) : (
            registros.map((registro, index) => (
              <tr
                key={registro.id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-gray-100 transition-colors`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                      {getInitials(registro.usuario_nombre, registro.usuario_apellido)}
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {registro.usuario_nombre} {registro.usuario_apellido}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-700">
                  {TIPO_LABELS[registro.tipo_evento] || registro.tipo_evento}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-700">
                  {registro.detalle}
                </td>
                <td className="px-6 py-4 text-center text-sm font-medium text-gray-900">
                  {formatMonto(registro.monto)}
                </td>
                <td className="px-6 py-4 text-center text-sm text-gray-500">
                  {formatDate(registro.fecha_creacion)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}