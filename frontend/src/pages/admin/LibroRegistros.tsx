// src/pages/admin/LibroRegistros.tsx
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
// 1. IMPORTAMOS LA SIDEBAR
import { SidebarAdmin } from "@/components/SidebarAdmin";
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


  // Filtrar por búsqueda
  const filtered = registros.filter((r) => {
    const searchText = `${r.usuario_nombre} ${r.usuario_apellido} ${r.detalle}`.toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    // CAMBIO 1: Layout Flex Vertical (Navbar arriba, resto abajo)
    <div className="flex flex-col h-screen w-full bg-gray-50 overflow-hidden font-sans">
      
      {/* NAVBAR: Fija arriba */}
      <Navbar />

      {/* CAMBIO 2: Contenedor dividido (Sidebar | Contenido) */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR: Fija a la izquierda */}
        <div className="h-full hidden md:block border-r bg-white">
          <SidebarAdmin className="h-full" />
        </div>

        {/* MAIN: Contenido principal con scroll propio */}
        <main className="flex-1 overflow-y-auto p-8">
          
          {/* Lógica de carga DENTRO del main para no ocultar la sidebar */}
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