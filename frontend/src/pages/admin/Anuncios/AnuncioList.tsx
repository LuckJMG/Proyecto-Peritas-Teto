import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, BookOpen, Trash2, RotateCw, Megaphone, Search } from "lucide-react";

interface AnuncioConAutor {
  id: number;
  titulo: string;
  contenido: string;
  fecha_publicacion: string;
  creado_por: number;
  condominio_id: number;
  activo: boolean;
  nombreAutor: string;
  avatarAutor: string;
}

interface AnuncioListProps {
  anuncios: AnuncioConAutor[];
  onEdit: (a: AnuncioConAutor) => void;
  onView: (a: AnuncioConAutor) => void;
  onDelete: (id: number) => void;
  loading: boolean;
  onRefresh: () => void;
}

export function AnuncioList({ anuncios, onEdit, onView, onDelete, loading, onRefresh }: AnuncioListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredAnuncios = anuncios.filter((anuncio) => 
    anuncio.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    anuncio.contenido.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-[#99D050]/20 border border-[#99D050]/30 h-full flex flex-col overflow-hidden">
      <div className="bg-white px-6 py-4 shrink-0 flex flex-col gap-4 border-b border-[#99D050]/20">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#99D050]/20 rounded-lg">
              <Megaphone className="h-5 w-5 text-[#99D050]" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Tablón de Avisos</h3>
            <span className="text-[10px] font-bold text-[#99D050] bg-[#99D050]/10 border border-[#99D050]/20 px-2 py-0.5 rounded-full">
              {filteredAnuncios.length} visibles
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={onRefresh} className="text-slate-400 hover:text-[#99D050] hover:bg-[#99D050]/10 rounded-full transition-colors" title="Recargar lista">
            <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Buscar por título o contenido..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-50 border-slate-200 focus:border-[#99D050] focus:ring-[#99D050]/20 h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-0 bg-slate-50/30">
        {loading && anuncios.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm animate-pulse">Cargando avisos...</div>
        ) : filteredAnuncios.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
            {searchTerm ? (
              <>
                <Search className="h-8 w-8 opacity-20" />
                <p className="text-sm font-medium">No se encontraron resultados para "{searchTerm}"</p>
                <Button variant="link" onClick={() => setSearchTerm("")} className="text-[#99D050] h-auto p-0">Limpiar búsqueda</Button>
              </>
            ) : (
              <p className="text-sm font-medium">No hay avisos registrados</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-[#99D050]/10">
            {filteredAnuncios.map((anuncio) => (
              <div key={anuncio.id} className="p-4 bg-white hover:bg-[#99D050]/5 transition-colors flex gap-4 group items-center animate-in fade-in duration-300">
                <Avatar className="h-11 w-11 border-2 border-gray-200 shadow-sm shrink-0">
                  <AvatarImage src={anuncio.avatarAutor} alt={anuncio.nombreAutor} />
                  <AvatarFallback className="bg-linear-to-br from-pink-400 via-purple-400 to-blue-400 text-white font-bold">
                    {anuncio.nombreAutor.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-bold text-slate-800 truncate pr-2">{anuncio.titulo}</h4>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                      {new Date(anuncio.fecha_publicacion).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">{anuncio.contenido}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{anuncio.nombreAutor}</p>
                </div>
                <div className="flex items-center gap-1 pl-2">
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-[#99D050] hover:bg-[#99D050]/10 rounded-lg transition-all" onClick={() => onEdit(anuncio)} title="Editar">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all" onClick={() => onView(anuncio)} title="Leer">
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all" onClick={() => onDelete(anuncio.id)} title="Eliminar">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
