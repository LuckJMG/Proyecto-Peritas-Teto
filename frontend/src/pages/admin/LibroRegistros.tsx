// src/pages/admin/LibroRegistros.tsx
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { registroService, type Registro, type TipoEvento } from "@/services/registroService";
import { ErrorAlert } from "@/components/registros/ErrorAlert";
import { RegistrosHeader } from "@/components/registros/RegistrosHeader";
import { RegistrosTable } from "@/components/registros/RegistrosTable";
import { Pagination } from "@/components/registros/Pagination";
import { AddRegistroDialog } from "@/components/registros/AddRegistroDialog";

const PAGE_SIZE = 20;

export default function LibroRegistros() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<TipoEvento | "all">("all");
  const [page, setPage] = useState(1);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadRegistros();
  }, [tipoFiltro]);

  const loadRegistros = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters = tipoFiltro !== "all" ? { tipo_evento: tipoFiltro } : undefined;
      const data = await registroService.getAll(filters);
      
      setRegistros(data);
    } catch (err) {
      setError("Error al cargar registros");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setSubmitting(true);
      await registroService.delete(id);
      await loadRegistros();
    } catch (err) {
      setError("Error al eliminar registro");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtrar por búsqueda
  const filtered = registros.filter((r) => {
    const searchText = `${r.usuario_nombre} ${r.usuario_apellido} ${r.detalle}`.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
          <ErrorAlert error={error} onClose={() => setError(null)} />

          <RegistrosHeader
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            tipoFiltro={tipoFiltro}
            setTipoFiltro={setTipoFiltro}
            onAddClick={() => setShowAddDialog(true)}
            setPage={setPage}
          />

          <RegistrosTable
            registros={visible}
            onDelete={handleDelete}
            submitting={submitting}
          />

          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
      </div>

      <AddRegistroDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={loadRegistros}
      />
    </div>
  );
}