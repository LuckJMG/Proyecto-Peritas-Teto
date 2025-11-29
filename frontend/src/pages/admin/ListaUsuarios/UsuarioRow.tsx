import { ChevronDown, Trash2, Calendar, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Usuario, RolUsuario } from "@/services/usuarioService";

interface UsuarioRowProps {
  usuario: Usuario;
  index: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onDelete: (u: Usuario) => void;
  onChangeRol: (u: Usuario, rol: RolUsuario) => void;
}

const ROLES: RolUsuario[] = ["ADMINISTRADOR", "CONSERJE", "DIRECTIVA", "RESIDENTE"];

export function UsuarioRow({
  usuario,
  index,
  isExpanded,
  onToggleExpand,
  onDelete,
  onChangeRol,
}: UsuarioRowProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatFecha = (f?: string) =>
    f ? new Date(f).toLocaleDateString() : "Sin registro";

  const deudaTotal = usuario.total_deuda || 0;
  const tieneDeuda = deudaTotal > 0;

  return (
    <>
      <tr
        className={`border-b cursor-pointer transition ${
          isExpanded ? "bg-gray-100" : index % 2 ? "bg-[#F9F9F9]" : "bg-white"
        } hover:bg-gray-100`}
        onClick={onToggleExpand}
      >
        <td className="px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
              {usuario.nombre[0]}
              {usuario.apellido[0]}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-sm font-medium text-gray-800">
                {usuario.nombre} {usuario.apellido}
              </span>
              <span className="text-xs text-gray-500">{usuario.email}</span>
              <span className="text-xs font-medium text-[#99D050] uppercase">
                {usuario.rol.replace("_", " ")}
              </span>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 text-center">
          {tieneDeuda ? (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#e05959] px-3 py-1 text-xs font-medium text-white">
              ● Deuda
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-[#bbd386] px-3 py-1 text-xs font-medium text-[#365314]">
              ● Al día
            </span>
          )}
        </td>
        <td className="px-4 py-4 text-center text-sm text-gray-700">
          <Calendar className="mr-1 inline h-4 w-4" />
          {formatFecha(usuario.fecha_ultimo_pago ?? usuario.fecha_creacion)}
        </td>
        <td className="px-4 py-4 text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-[#404040] text-sm text-white hover:bg-[#303030]">
                Administrar
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {ROLES.map((rol) => (
                <DropdownMenuItem
                  key={rol}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChangeRol(usuario, rol);
                  }}
                >
                  Cambiar a {rol}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(usuario);
                }}
                className="text-[#e05959]"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {isExpanded && (
        <tr className="border-b border-gray-200 bg-gray-50">
          <td colSpan={4}>
            <div className="grid grid-cols-3 gap-4 p-6 text-sm text-gray-700">
              <div>
                <p className="font-semibold">
                  {usuario.nombre} {usuario.apellido}
                </p>
                <p className="text-gray-500">
                  24 años, nacida el 11/11/2000 (demo)
                </p>
                <p className="text-gray-500">Habita el departamento 608 (demo)</p>
              </div>
              <div>
                <p
                  className={`font-medium ${
                    tieneDeuda ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatCurrency(deudaTotal)} de saldo pendiente
                </p>
                <p className="text-gray-500">10 meses de morosidad (demo)</p>
                <p className="text-gray-500">30 reservas realizadas (demo)</p>
              </div>
              <div>
                <p className="flex items-center gap-2 font-medium">
                  <Phone className="h-4 w-4" /> +56 9 5966 4093 (demo)
                </p>
                <p className="flex items-center gap-2 text-gray-500">
                  <Mail className="h-4 w-4" />
                  {usuario.email}
                </p>
                <p className="text-gray-500">
                  Contacto actualizado al{" "}
                  {formatFecha(usuario.ultimo_acceso || usuario.fecha_creacion)}
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
