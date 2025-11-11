// src/pages/admin/ListaUsuarios.tsx

import { useState, useEffect } from "react";
import {
  Search,
  ArrowUpDown,
  ChevronDown,
  Loader2,
  AlertCircle,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Navbar from "@/components/Navbar";
import {
  usuarioService,
  type Usuario,
  type RolUsuario,
} from "@/services/usuarioService";
import {
  condominioService,
  type Condominio,
} from "@/services/condominioService";

interface SortConfig {
  key: keyof Usuario | null;
  direction: "asc" | "desc";
}

const ROLES: RolUsuario[] = [
  "ADMINISTRADOR",
  "CONSERJE",
  "DIRECTIVA",
  "RESIDENTE",
];
const PAGE_SIZE = 10;

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [condominioFiltro, setCondominioFiltro] = useState<number | "all">(
    "all",
  );
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [submitting, setSubmitting] = useState(false);

const [newUsuario, setNewUsuario] = useState({
  nombre: "",
  apellido: "",
  email: "",
  rol: "RESIDENTE" as RolUsuario,  // 👈 valor válido
  password_hash: "",
  condominio_id: undefined as number | undefined,
  activo: true,
});

  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [u, c] = await Promise.all([
          usuarioService.getAll(),
          condominioService.getAll(),
        ]);
        setUsuarios(u);
        setCondominios(c);
      } catch (err) {
        setError("Error al cargar datos");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSort = (key: keyof Usuario) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const getSorted = (items: Usuario[]) => {
    const key = sortConfig.key;
    if (!key) return items;
    return [...items].sort((a, b) => {
      const aVal = (a as any)[key];
      const bVal = (b as any)[key];
      if (aVal == null || bVal == null) return 0;
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filtered = usuarios.filter((u) => {
    const textMatch = `${u.nombre} ${u.apellido} ${u.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const condMatch =
      condominioFiltro === "all" || u.condominio_id === condominioFiltro;
    return textMatch && condMatch;
  });

  const sorted = getSorted(filtered);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = (u: Usuario) => {
    setSelectedUsuario(u);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedUsuario) return;
    try {
      setSubmitting(true);
      await usuarioService.delete(selectedUsuario.id);
      const data = await usuarioService.getAll();
      setUsuarios(data);
      setShowDeleteDialog(false);
      setSelectedUsuario(null);
    } catch (err) {
      setError("Error al eliminar usuario");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddUsuario = async () => {
    if (
      !newUsuario.nombre.trim() ||
      !newUsuario.apellido.trim() ||
      !newUsuario.email.trim() ||
      !newUsuario.password_hash.trim()
    ) {
      setError("Completa todos los campos obligatorios");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await usuarioService.create(newUsuario);
      const data = await usuarioService.getAll();
      setUsuarios(data);
      setShowAddDialog(false);
      setNewUsuario({
        nombre: "",
        apellido: "",
        email: "",
        rol: "RESIDENTE",
        password_hash: "",
        condominio_id: undefined,
        activo: true,
      });
    } catch (err) {
      setError("Error al crear usuario");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRol = async (u: Usuario, rol: RolUsuario) => {
    try {
      setSubmitting(true);
      const actualizado = await usuarioService.update(u.id, { rol });
      setUsuarios((prev) =>
        prev.map((item) => (item.id === u.id ? actualizado : item)),
      );
    } catch (err) {
      setError("Error al actualizar rol");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex h-[calc(100vh-80px)] items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-[#99D050]" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-8">
        <div className="mx-auto max-w-7xl">
          {/* Error */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4" />
              <span>{error}</span>
              <button
                className="ml-auto text-xs font-semibold"
                onClick={() => setError(null)}
              >
                Cerrar
              </button>
            </div>
          )}

          {/* header: búsqueda + filtro condominio + botón añadir */}
          <div className="mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-80">
                <Input
                  type="text"
                  placeholder="Nombre / Apellido / Email"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="h-12 rounded-full border-gray-300 bg-white pl-4 pr-10 text-gray-700 placeholder:text-gray-400"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <div className="h-6 w-px bg-gray-300" />
                  <Search className="h-5 w-5 text-gray-600" />
                </div>
              </div>

              {/* filtro por condominio */}
              <select
                value={condominioFiltro === "all" ? "" : condominioFiltro}
                onChange={(e) =>
                  setCondominioFiltro(
                    e.target.value === ""
                      ? "all"
                      : Number.parseInt(e.target.value),
                  )
                }
                className="h-10 rounded-full border border-gray-300 bg-white px-3 text-xs text-gray-700"
              >
                <option value="">Todos los condominios</option>
                {condominios.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <Button
              onClick={() => setShowAddDialog(true)}
              className="bg-[#99D050] font-medium text-white hover:bg-[#88bf40]"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Añadir Residente
            </Button>
          </div>

          {/* tabla */}
          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="w-full">
              <thead className="border-b border-gray-300 bg-[#e5e5e5]">
                <tr>
                  <th className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleSort("nombre")}
                      className="mx-auto flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900"
                    >
                      Nombre
                      <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">
                    Estado de cuenta
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">
                    Último pago
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No se encontraron usuarios
                    </td>
                  </tr>
                ) : (
                  visible.map((u, index) => (
                    <RowUsuario
                      key={u.id}
                      usuario={u}
                      index={index}
                      expandedId={expandedId}
                      setExpandedId={setExpandedId}
                      onDelete={handleDelete}
                      onChangeRol={handleChangeRol}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* paginación */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="disabled:text-gray-300"
            >
              ‹ Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="disabled:text-gray-300"
            >
              Siguiente ›
            </button>
          </div>
        </div>
      </div>

      {/* dialog eliminar */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>¿Eliminar usuario?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente al usuario{" "}
              <b>
                {selectedUsuario?.nombre} {selectedUsuario?.apellido}
              </b>
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between mt-6 w-full">
            <Button
                onClick={confirmDelete}
                disabled={submitting}
                className="w-1/2 bg-[#e05959] hover:bg-[#d04848] text-white font-semibold h-12"
            >
                {submitting ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Eliminando...
                </>
                ) : (
                'Eliminar'
                )}
            </Button>
            <Button
                onClick={() => setShowDeleteDialog(false)}
                variant="outline"
                className="w-1/2 h-12 font-semibold"
                disabled={submitting}
            >
                Cancelar
            </Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* dialog añadir: botón verde ancho y cancelar centrado como en el diseño */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Añadir Residente</DialogTitle>
            <DialogDescription>
              Completa la información del nuevo residente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <Input
              placeholder="Nombre"
              value={newUsuario.nombre}
              onChange={(e) =>
                setNewUsuario({ ...newUsuario, nombre: e.target.value })
              }
            />
            <Input
              placeholder="Apellido"
              value={newUsuario.apellido}
              onChange={(e) =>
                setNewUsuario({ ...newUsuario, apellido: e.target.value })
              }
            />
            <Input
              placeholder="Email"
              value={newUsuario.email}
              onChange={(e) =>
                setNewUsuario({ ...newUsuario, email: e.target.value })
              }
            />
            <Input
              type="password"
              placeholder="Contraseña"
              value={newUsuario.password_hash}
              onChange={(e) =>
                setNewUsuario({
                  ...newUsuario,
                  password_hash: e.target.value,
                })
              }
            />

            {/* rol */}
            <select
              value={newUsuario.rol}
              onChange={(e) =>
                setNewUsuario({
                  ...newUsuario,
                  rol: e.target.value as RolUsuario,
                })
              }
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700"
            >
              {ROLES.map((rol) => (
                <option key={rol} value={rol}>
                  {rol}
                </option>
              ))}
            </select>

            {/* condominio */}
            <select
              value={newUsuario.condominio_id ?? ""}
              onChange={(e) =>
                setNewUsuario({
                  ...newUsuario,
                  condominio_id: e.target.value
                    ? Number.parseInt(e.target.value)
                    : undefined,
                })
              }
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700"
            >
              <option value="">Condominio (opcional)</option>
              {condominios.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-col">
            <Button
                onClick={handleAddUsuario}
                disabled={submitting}
                className="w-full bg-[#99D050] hover:bg-[#88bf40] text-white font-medium"
            >
                {submitting ? "Creando..." : "Crear Residente"}
            </Button>
            <Button
                onClick={() => setShowAddDialog(false)}
                variant="outline"
                className="w-full"
                disabled={submitting}
            >
                Cancelar
            </Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* -------- fila + panel expandible -------- */

type RowProps = {
  usuario: Usuario;
  index: number;
  expandedId: number | null;
  setExpandedId: (id: number | null) => void;
  onDelete: (u: Usuario) => void;
  onChangeRol: (u: Usuario, rol: RolUsuario) => void;
};

function RowUsuario({
  usuario,
  index,
  expandedId,
  setExpandedId,
  onDelete,
  onChangeRol,
}: RowProps) {
  const expanded = expandedId === usuario.id;

  const formatFecha = (f?: string) =>
    f ? new Date(f).toLocaleDateString() : "Sin registro";

  return (
    <>
      <tr
        className={`border-b cursor-pointer transition ${
          expanded ? "bg-gray-100" : index % 2 ? "bg-[#F9F9F9]" : "bg-white"
        } hover:bg-gray-100`}
        onClick={() => setExpandedId(expanded ? null : usuario.id)}
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
          {usuario.estado_cuenta === "DEUDA" ? (
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
                  onClick={() => onChangeRol(usuario, rol)}
                >
                  Cambiar a {rol}
                </DropdownMenuItem>
              ))}
              <DropdownMenuItem
                onClick={() => onDelete(usuario)}
                className="text-[#e05959]"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {expanded && (
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
                <p className="text-gray-500">Habita el departamento 608</p>
              </div>
              <div>
                <p className="font-medium">$500.000 de saldo pendiente</p>
                <p className="text-gray-500">10 meses de morosidad</p>
                <p className="text-gray-500">30 reservas realizadas</p>
              </div>
              <div>
                <p className="flex items-center gap-2 font-medium">
                  <Phone className="h-4 w-4" /> +56 9 5966 4093
                </p>
                <p className="flex items-center gap-2 text-gray-500">
                  <Mail className="h-4 w-4" />
                  {usuario.email}
                </p>
                <p className="text-gray-500">
                  Contacto actualizado al 10/06/2017
                </p>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
