import { useState, useEffect } from "react";
import { ArrowUpDown, Loader2, AlertCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import { SidebarAdmin } from "@/components/SidebarAdmin";
import {
  usuarioService,
  type Usuario,
} from "@/services/usuarioService";
import {
  condominioService,
  type Condominio,
} from "@/services/condominioService";

// 1. IMPORTAR EL HOOK
import { useRegistroAutomatico } from "@/services/registroService";

import { UsuarioFilters } from "./UsuarioFilters";
import { UsuarioRow } from "./UsuarioRow";
import { AddUsuarioDialog } from "./AddUsuarioDialog";
import { DeleteUsuarioDialog } from "./DeleteUsuarioDialog";
import { EditUsuarioDialog } from "./EditUsuarioDialog";

interface SortConfig {
  key: keyof Usuario | null;
  direction: "asc" | "desc";
}

const PAGE_SIZE = 10;

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [condominios, setCondominios] = useState<Condominio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [condominioFiltro, setCondominioFiltro] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: null,
    direction: "asc",
  });

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 2. INICIALIZAR EL HOOK
  const { registrar } = useRegistroAutomatico();

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : null;

      const [allUsuarios, allCondominios] = await Promise.all([
        usuarioService.getAll(),
        condominioService.getAll(),
      ]);

      if (currentUser && currentUser.rol !== "SUPER_ADMINISTRADOR") {
        const myUsers = allUsuarios.filter(
          (u) => u.condominio_id === currentUser.condominio_id
        );
        setUsuarios(myUsers);

        const myCondos = allCondominios.filter(
          (c) => c.id === currentUser.condominio_id
        );
        setCondominios(myCondos);
        
        setCondominioFiltro(currentUser.condominio_id || "all");
      } else {
        setUsuarios(allUsuarios);
        setCondominios(allCondominios);
      }

    } catch (err) {
      setError("Error al cargar datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSort = (key: keyof Usuario) => {
    let direction: "asc" | "desc" = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filtered = usuarios.filter((u) => {
    const textMatch = `${u.nombre} ${u.apellido} ${u.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const condMatch =
      condominioFiltro === "all" || u.condominio_id === condominioFiltro;
    return textMatch && condMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal == null || bVal == null) return 0;
    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const visible = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDeleteClick = (u: Usuario) => {
    setSelectedUsuario(u);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedUsuario) return;
    try {
      setIsDeleting(true);
      await usuarioService.delete(selectedUsuario.id);

      // 3. REGISTRO AUTOMÁTICO (Eliminación)
      // Obtenemos admin para condominio_id
      const userStr = localStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : {};

      await registrar(
        "ELIMINACION",
        `Admin eliminó al usuario ${selectedUsuario.nombre} ${selectedUsuario.apellido} (ID: ${selectedUsuario.id})`,
        {
            condominio_id: user.condominio_id
        }
      );

      await loadData();
      setShowDeleteDialog(false);
      setSelectedUsuario(null);
    } catch (err) {
      setError("Error al eliminar usuario");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditClick = (u: Usuario) => {
    setUsuarioToEdit(u);
    setShowEditDialog(true);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="h-full hidden md:block border-r bg-white">
          <SidebarAdmin className="h-full" />
        </div>

        <main className="flex-1 overflow-y-auto p-8">
          {loading ? (
             <div className="flex h-full items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-[#99D050]" />
             </div>
          ) : (
             <div className="mx-auto max-w-7xl">
                {error && (
                  <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4" />
                    <span>{error}</span>
                    <button className="ml-auto text-xs font-semibold" onClick={() => setError(null)}>
                      Cerrar
                    </button>
                  </div>
                )}

                <UsuarioFilters
                  searchTerm={searchTerm}
                  onSearchChange={(t) => { setSearchTerm(t); setPage(1); }}
                  condominioFiltro={condominioFiltro}
                  onCondominioChange={setCondominioFiltro}
                  condominios={condominios}
                  onAddClick={() => setShowAddDialog(true)}
                />

                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                  <table className="w-full">
                    <thead className="border-b border-gray-300 bg-[#e5e5e5]">
                      <tr>
                        <th className="px-4 py-2 text-center">
                          <button onClick={() => handleSort("nombre")} className="mx-auto flex items-center gap-2 text-xs font-semibold text-gray-700 hover:text-gray-900">
                            Nombre <ArrowUpDown className="h-3 w-3" />
                          </button>
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Estado de cuenta</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Último pago</th>
                        <th className="px-4 py-2 text-center text-xs font-semibold text-gray-700">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No se encontraron usuarios</td>
                        </tr>
                      ) : (
                        visible.map((u, index) => (
                          <UsuarioRow
                            key={u.id}
                            usuario={u}
                            index={index}
                            isExpanded={expandedId === u.id}
                            onToggleExpand={() => setExpandedId(expandedId === u.id ? null : u.id)}
                            onDelete={handleDeleteClick}
                            onEdit={handleEditClick}
                          />
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
                  <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="disabled:text-gray-300">
                    ‹ Anterior
                  </button>
                  <span>Página {page} de {totalPages}</span>
                  <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="disabled:text-gray-300">
                    Siguiente ›
                  </button>
                </div>
             </div>
          )}
        </main>
      </div>

      <AddUsuarioDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={loadData}
        condominios={condominios}
      />

      <EditUsuarioDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        usuario={usuarioToEdit}
        onSuccess={loadData}
      />

      <DeleteUsuarioDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        usuario={selectedUsuario}
        onConfirm={confirmDelete}
        isSubmitting={isDeleting}
      />
    </div>
  );
}