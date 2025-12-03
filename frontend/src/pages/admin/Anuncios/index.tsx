import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { SidebarAdmin } from "@/components/SidebarAdmin";
import { CreateAnuncioForm } from "./CreateAnuncioForm";
import { AnuncioList } from "./AnuncioList";
import { EditViewAnuncio } from "./EditViewAnuncio";
import { DeleteAnuncioDialog } from "./DeleteAnuncioDialog";
import { ErrorDialog } from "./ErrorDialog"; 
import type { Anuncio } from "@/types/anuncio.types";
import { anuncioService } from "@/services/anuncioService";
import { usuarioService } from "@/services/usuarioService";

// Extendemos el tipo Anuncio para incluir datos del autor
export interface AnuncioConAutor extends Anuncio {
  nombreAutor: string;
  avatarAutor: string;
}

export default function AnunciosPage() {
  const [anuncios, setAnuncios] = useState<AnuncioConAutor[]>([]);
  const [selectedAnuncio, setSelectedAnuncio] = useState<AnuncioConAutor | null>(null);
  const [mode, setMode] = useState<"edit" | "view" | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const showError = (msg: string) => setErrorMsg(msg);

  const fetchAnuncios = async () => {
    setLoading(true);
    try {
      const [anunciosData, usuarios] = await Promise.all([
        anuncioService.getAll(0, 100),
        usuarioService.getAll()
      ]);
      
      // Enriquecer anuncios con datos del autor
      const anunciosConAutor: AnuncioConAutor[] = anunciosData.map(anuncio => {
        const autor = usuarios.find(u => u.id === anuncio.creado_por);
        const nombreAutor = autor ? `${autor.nombre} ${autor.apellido}` : `Usuario ${anuncio.creado_por}`;
        
        return {
          ...anuncio,
          nombreAutor,
          avatarAutor: `https://api.dicebear.com/7.x/avataaars/svg?seed=${nombreAutor}`
        };
      });
      
      setAnuncios(anunciosConAutor);
    } catch (error) {
      console.error("Error al cargar:", error);
      showError("Error al cargar los anuncios");
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

  const handleEdit = (anuncio: AnuncioConAutor) => {
    setSelectedAnuncio(anuncio);
    setMode("edit");
  };

  const handleView = (anuncio: AnuncioConAutor) => {
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
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-white font-sans">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <div className="h-full border-r bg-white">
            <SidebarAdmin className="w-64 h-full shrink-0" />
        </div>

        <main className="flex-1 p-6 h-full w-full overflow-hidden flex flex-col min-h-0 bg-white">
          <div className="grid grid-rows-[55%_42%] gap-6 h-full w-full min-h-0">
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
