import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { CreateAnuncioForm } from "./components/CreateAnuncioForm";
import { AnuncioList } from "./components/AnuncioList";
import { EditViewAnuncio } from "./components/EditViewAnuncio";
import { DeleteAnuncioDialog } from "./components/DeleteAnuncioDialog";
import { ErrorDialog } from "./components/ErrorDialog"; // Nuevo import
import type { Anuncio } from "@/types/anuncio.types";
import { anuncioService } from "@/services/anuncioService";

export default function AnunciosPage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [selectedAnuncio, setSelectedAnuncio] = useState<Anuncio | null>(null);
  const [mode, setMode] = useState<"edit" | "view" | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estado para Errores
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Estados para eliminar
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Helper para mostrar errores desde cualquier hijo
  const showError = (msg: string) => setErrorMsg(msg);

  const fetchAnuncios = async () => {
    setLoading(true);
    try {
      const data = await anuncioService.getAll(0, 100);
      setAnuncios(data);
    } catch (error) {
      console.error("Error al cargar:", error);
      // Opcional: showError("No se pudieron cargar los anuncios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnuncios();
  }, []);

  const handleCreateSuccess = () => {
    fetchAnuncios();
  };

  const handleEdit = (anuncio: Anuncio) => {
    setSelectedAnuncio(anuncio);
    setMode("edit");
  };

  const handleView = (anuncio: Anuncio) => {
    setSelectedAnuncio(anuncio);
    setMode("view");
  };

  const handleUpdateSuccess = () => {
    fetchAnuncios();
  };

  const reqDelete = (id: number) => setDeleteId(id);

  const confirmDelete = async () => {
    if (deleteId === null) return;
    setIsDeleting(true);
    try {
      await anuncioService.delete(deleteId);
      if (selectedAnuncio?.id === deleteId) {
        setSelectedAnuncio(null);
        setMode(null);
      }
      await fetchAnuncios();
      setDeleteId(null);
    } catch (error) {
      console.error(error);
      showError("No se pudo eliminar el aviso. Intenta nuevamente.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#99D050]/10 font-sans">
      <Sidebar className="w-64 flex-shrink-0 border-r bg-white z-20 shadow-xl shadow-[#99D050]/10" />

      <div className="flex flex-1 flex-col h-full overflow-hidden relative">
        <Navbar />

        <main className="flex-1 p-6 h-full w-full overflow-hidden flex flex-col min-h-0">
          <div className="grid grid-rows-[55%_42%] gap-6 h-full w-full min-h-0">
            
            {/* FILA 1 */}
            <div className="grid grid-cols-12 gap-6 h-full min-h-0">
              <div className="col-span-5 h-full min-h-0">
                <CreateAnuncioForm 
                  onSuccess={handleCreateSuccess} 
                  onError={showError} 
                />
              </div>
              <div className="col-span-7 h-full min-h-0">
                <AnuncioList 
                  anuncios={anuncios}
                  onEdit={handleEdit}
                  onView={handleView}
                  onDelete={reqDelete}
                  loading={loading}
                  onRefresh={fetchAnuncios}
                />
              </div>
            </div>

            {/* FILA 2 */}
            <div className="h-full w-full min-h-0">
              <EditViewAnuncio 
                anuncio={selectedAnuncio}
                mode={mode}
                onClose={() => {
                  setSelectedAnuncio(null);
                  setMode(null);
                }}
                onUpdate={handleUpdateSuccess}
                onError={showError}
              />
            </div>
          </div>
        </main>

        {/* MODALES */}
        <DeleteAnuncioDialog 
          open={!!deleteId} 
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={confirmDelete}
          loading={isDeleting}
        />

        <ErrorDialog 
          isOpen={!!errorMsg} 
          onClose={() => setErrorMsg(null)} 
          message={errorMsg || ""} 
        />
      </div>
    </div>
  );
}