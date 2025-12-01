import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { SidebarAdmin } from "@/components/SidebarAdmin";
import { CreateAnuncioForm } from "./components/CreateAnuncioForm";
import { AnuncioList } from "./components/AnuncioList";
import { EditViewAnuncio } from "./components/EditViewAnuncio";
import { DeleteAnuncioDialog } from "./components/DeleteAnuncioDialog";
import { ErrorDialog } from "./components/ErrorDialog"; 
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
    // CAMBIO 1: flex-col para apilar Navbar arriba del resto
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#99D050]/10 font-sans">
      
      {/* NAVBAR: Ahora está arriba ocupando todo el ancho */}
      <Navbar />

      {/* CAMBIO 2: Nuevo contenedor FLEX ROW para dividir Sidebar y Main */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR: A la izquierda, debajo de la navbar */}
        <div className="h-full border-r bg-white">
            <SidebarAdmin className="w-64 h-full flex-shrink-0" />
        </div>

        {/* MAIN: A la derecha */}
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
      </div>

      {/* MODALES (Fuera del layout visual pero dentro del root) */}
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
  );
}