import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { SidebarAdmin } from "@/components/SidebarAdmin";
import { registroService, type Registro, type TipoEvento } from "@/services/registroService";
import { ErrorAlert } from "./ErrorAlert";
import { RegistrosHeader } from "./RegistrosHeader";
import { RegistrosTable } from "./RegistrosTable";
import { Pagination } from "./Pagination";
import { AddRegistroDialog } from "./AddRegistroDialog";

const PAGE_SIZE = 20;

export default function LibroRegistros() {
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState<TipoEvento | "all">("all");
  const [page, setPage] = useState(1);
  
  const [showAddDialog, setShowAddDialog] = useState(false);

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

  // Filtrar por búsqueda en frontend
  const filtered = registros.filter((r) => {
    const searchText = `${r.usuario_nombre} ${r.usuario_apellido} ${r.detalle}`.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
              />

              <Pagination page={page} totalPages={totalPages} setPage={setPage} />
            </div>
          )}
        </main>
      </div>

      <AddRegistroDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={loadRegistros}
      />
    </div>
  );
}
