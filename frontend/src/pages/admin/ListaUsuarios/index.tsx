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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { useRegistroAutomatico } from "@/services/registroService";
import { UsuarioFilters } from "./UsuarioFilters";
import { UsuarioRow } from "./UsuarioRow";
import { AddUsuarioDialog } from "./AddUsuarioDialog";
import { DeleteUsuarioDialog } from "./DeleteUsuarioDialog";
import { EditUsuarioDialog } from "./EditUsuarioDialog";
import { AdjustDeudaDialog } from "./AdjustDeudaDialog";

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
  const [showAdjustDialog, setShowAdjustDialog] = useState(false);
  
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [usuarioToEdit, setUsuarioToEdit] = useState<Usuario | null>(null);
  const [usuarioToAdjust, setUsuarioToAdjust] = useState<Usuario | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Inicializar hook
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

  // --- Handlers de Acciones ---
  const handleDeleteClick = (u: Usuario) => {
    setSelectedUsuario(u);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedUsuario) return;
    try {
      setIsDeleting(true);
      await usuarioService.delete(selectedUsuario.id);

      // Registro Automático
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

  const handleAjustarClick = (u: Usuario) => {
    setUsuarioToAdjust(u);
    setShowAdjustDialog(true);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-muted/40 font-sans">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="h-full hidden md:block border-r bg-background">
          <SidebarAdmin className="h-full" />
        </div>

        <main className="flex-1 overflow-y-auto p-8">
          {loading ? (
             <div className="flex h-full items-center justify-center">
               <Loader2 className="h-12 w-12 animate-spin text-[#99D050]" />
             </div>
          ) : (
             <div className="mx-auto max-w-7xl space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Gestión de Usuarios</h1>
                    <p className="text-muted-foreground mt-1">Administra residentes, conserjes y directiva.</p>
                  </div>
                </div>

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

                <div className="overflow-hidden rounded-md border bg-white shadow-sm">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="text-center w-[30%]">
                          <Button 
                            variant="ghost" 
                            onClick={() => handleSort("nombre")} 
                            className="flex items-center gap-1 font-semibold hover:bg-transparent p-0 mx-auto"
                          >
                            Nombre <ArrowUpDown className="h-3 w-3" />
                          </Button>
                        </TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-700 w-[20%]">Estado de cuenta</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-700 w-[20%]">Último pago</TableHead>
                        <TableHead className="text-center text-xs font-semibold text-gray-700 w-[30%]">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {visible.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                            No se encontraron usuarios
                          </TableCell>
                        </TableRow>
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
                            onAjustar={handleAjustarClick}
                          />
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginación simple */}
                <div className="flex items-center justify-center gap-4 text-xs text-gray-600 pt-4">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === 1} 
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Anterior
                  </Button>
                  <span>Página {page} de {totalPages}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    disabled={page === totalPages} 
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Siguiente
                  </Button>
                </div>
             </div>
          )}
        </main>
      </div>

      {/* --- DIÁLOGOS --- */}
      <AddUsuarioDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={loadData}
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

      <AdjustDeudaDialog
        open={showAdjustDialog}
        onOpenChange={setShowAdjustDialog}
        usuario={usuarioToAdjust}
      />
    </div>
  );
}
