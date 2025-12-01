import { ChevronDown, ChevronUp, Trash2, Pencil } from "lucide-react";
import { type Usuario } from "@/services/usuarioService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface UsuarioRowProps {
  usuario: Usuario;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: (u: Usuario) => void;
  onEdit: (u: Usuario) => void;
}

export function UsuarioRow({
  usuario,
  index,
  isExpanded,
  onToggleExpand,
  onDelete,
  onEdit,
}: UsuarioRowProps) {
  
  const formatCurrency = (amount?: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
    }).format(amount || 0);
  };

  return (
    <>
      <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
        {/* Columna Nombre */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#99D050]/20 text-[#99D050] font-bold text-xs">
              {usuario.nombre.charAt(0)}
              {usuario.apellido.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 text-sm">
                {usuario.nombre} {usuario.apellido}
              </span>
              <span className="text-xs text-gray-500">{usuario.email}</span>
              <div className="mt-0.5">
                <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 border-gray-300 text-gray-500">
                  {usuario.rol}
                </Badge>
              </div>
            </div>
          </div>
        </td>

        {/* Columna Estado de Cuenta */}
        <td className="px-4 py-3 text-center">
          {(usuario.total_deuda || 0) > 0 ? (
            <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-none shadow-sm">
              Deuda: {formatCurrency(usuario.total_deuda)}
            </Badge>
          ) : (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-sm">
              Al día
            </Badge>
          )}
        </td>

        {/* Columna Último Pago */}
        <td className="px-4 py-3 text-center text-xs text-gray-500">
          {usuario.fecha_ultimo_pago ? new Date(usuario.fecha_ultimo_pago).toLocaleDateString() : "-"}
        </td>

        {/* Columna Acciones */}
        <td className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              onClick={() => onEdit(usuario)}
              title="Editar usuario"
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => onDelete(usuario)}
              title="Eliminar usuario"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400"
              onClick={onToggleExpand}
              title="Ver detalles"
            >
               {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </td>
      </tr>
      
      {/* --- SECCIÓN EXPANDIDA MODIFICADA --- */}
      {isExpanded && (
        <tr className="bg-gray-50 border-b border-gray-200">
          <td colSpan={4} className="p-4">
             <div className="text-sm text-gray-600 pl-12 grid grid-cols-2 gap-4">
                <div>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Vivienda:</span> 
                      {usuario.vivienda || <span className="italic text-gray-400">No asignada</span>}
                    </p>
                    <p className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-gray-700">Teléfono:</span> 
                      {usuario.telefono || <span className="italic text-gray-400">No registrado</span>}
                    </p>
                </div>
                <div>
                    <p className="flex items-center gap-2">
                      <span className="font-semibold text-gray-700">Último Acceso:</span> 
                      {usuario.ultimo_acceso ? new Date(usuario.ultimo_acceso).toLocaleString() : "Nunca"}
                    </p>
                    <p className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-gray-700">Fecha Registro:</span> 
                      {new Date(usuario.fecha_creacion).toLocaleDateString()}
                    </p>
                </div>
             </div>
          </td>
        </tr>
      )}
    </>
  );
}