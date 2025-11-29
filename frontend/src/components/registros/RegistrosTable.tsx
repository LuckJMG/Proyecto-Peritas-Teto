// src/components/registros/RegistrosTable.tsx
import { Pencil, Trash2 } from "lucide-react";
import type { Registro } from "@/services/registroService";

interface RegistrosTableProps {
  registros: Registro[];
  onDelete: (id: number) => void;
  submitting: boolean;
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

export function RegistrosTable({ registros, onDelete, submitting }: RegistrosTableProps) {
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
              Acciones
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
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => onDelete(registro.id)}
                      disabled={submitting}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}