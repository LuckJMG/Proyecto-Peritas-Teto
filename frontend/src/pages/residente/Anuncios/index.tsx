// frontend/src/pages/residente/Anuncios/index.tsx
import { useState, useEffect } from "react";
import { Loader2, Megaphone, Search } from "lucide-react";
import NavbarResidente from "@/components/NavbarResidente";
import { AnuncioCard } from "./AnuncioCard";
import { AnuncioDetailDialog } from "./AnuncioDetailDialog";
import { Input } from "@/components/ui/input";
import { anuncioService } from "@/services/anuncioService";
import type { Anuncio } from "@/types/anuncio.types";

export default function AnunciosResidente() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAnuncio, setSelectedAnuncio] = useState<Anuncio | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    loadAnuncios();
  }, []);

  const loadAnuncios = async () => {
    try {
      setLoading(true);
      // Obtenemos los anuncios más recientes primero
      const data = await anuncioService.getAll();
      // Ordenamiento manual por si el backend no lo hace (fecha más reciente primero)
      const sorted = data.sort((a, b) => 
        new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime()
      );
      setAnuncios(sorted);
    } catch (error) {
      console.error("Error al cargar anuncios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (anuncio: Anuncio) => {
    setSelectedAnuncio(anuncio);
    setDialogOpen(true);
  };

  const filteredAnuncios = anuncios.filter(a => 
    a.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.contenido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <NavbarResidente />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              Tablón de Anuncios
            </h1>
            <p className="text-gray-500 mt-2 ml-1">
              Mantente informado de las últimas novedades de tu comunidad.
            </p>
          </div>

          {/* Buscador */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Buscar comunicados..." 
              className="pl-9 bg-white border-gray-200 focus:border-[#99D050] focus:ring-[#99D050]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Contenido */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-10 h-10 animate-spin text-[#99D050]" />
          </div>
        ) : filteredAnuncios.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No hay anuncios publicados</h3>
            <p className="text-gray-500 mt-1">
              {searchTerm ? "No se encontraron resultados para tu búsqueda." : "Los comunicados de la administración aparecerán aquí."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnuncios.map((anuncio) => (
              <AnuncioCard 
                key={anuncio.id} 
                anuncio={anuncio} 
                onClick={handleCardClick} 
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal de Detalle */}
      <AnuncioDetailDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        anuncio={selectedAnuncio} 
      />
    </div>
  );
}