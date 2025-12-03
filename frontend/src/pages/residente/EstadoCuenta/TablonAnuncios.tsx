import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Megaphone, ChevronRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { anuncioService } from "@/services/anuncioService";
import type { Anuncio } from "@/types/anuncio.types";

export default function TablonAnuncios() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnuncios = async () => {
      try {
        setLoading(true);
        // Obtenemos los anuncios
        const data = await anuncioService.getAll();
        
        // Ordenamos por fecha (más reciente primero) y tomamos solo los 3 primeros
        const sorted = data.sort((a, b) => 
          new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime()
        ).slice(0, 3);
        
        setAnuncios(sorted);
      } catch (error) {
        console.error("Error cargando anuncios", error);
      } finally {
        setLoading(false);
      }
    };

    loadAnuncios();
  }, []);

  if (loading) return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 h-[300px] flex items-center justify-center text-gray-500 shadow-sm">
      Cargando anuncios...
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-[#99D050]" />
          Anuncios
        </h2>
        
        <Link to="/anuncios">
          <Button 
            className="bg-[#99D050] hover:bg-[#8bc040] text-white shadow-sm h-8 px-3 text-xs font-bold rounded-md transition-all active:scale-95"
          >
            Ver más <ChevronRight className="ml-1 h-3 w-3" />
          </Button>
        </Link>
      </div>

      <div className="flex-1 space-y-4">
        {anuncios.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No hay anuncios recientes.
          </div>
        ) : (
          anuncios.map((anuncio) => (
            <div 
              key={anuncio.id} 
              className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-colors group cursor-default"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 group-hover:text-[#99D050] transition-colors">
                  {anuncio.titulo}
                </h3>
                <span className="text-[10px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-100 whitespace-nowrap flex items-center gap-1 shrink-0">
                  <Calendar className="w-3 h-3" />
                  {new Date(anuncio.fecha_publicacion).toLocaleDateString("es-CL", {
                    day: 'numeric', month: 'short'
                  })}
                </span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {anuncio.contenido}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
