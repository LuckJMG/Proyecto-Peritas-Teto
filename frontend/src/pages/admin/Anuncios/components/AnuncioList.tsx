import type { Anuncio } from "@/types/anuncio.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Pencil, BookOpen, Trash2, RotateCw, Megaphone } from "lucide-react";

interface AnuncioListProps {
  anuncios: Anuncio[];
  onEdit: (a: Anuncio) => void;
  onView: (a: Anuncio) => void;
  onDelete: (id: number) => void;
  loading: boolean;
  onRefresh: () => void;
}

export function AnuncioList({ anuncios, onEdit, onView, onDelete, loading, onRefresh }: AnuncioListProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-[#99D050]/20 border border-[#99D050]/30 h-full flex flex-col overflow-hidden">
      
      {/* Header */}
      <div className="bg-white px-6 py-4 shrink-0 flex justify-between items-center border-b border-[#99D050]/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#99D050]/20 rounded-lg">
            <Megaphone className="h-5 w-5 text-[#99D050]" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">
            Tablón de Avisos
          </h3>
          <span className="text-[10px] font-bold text-[#99D050] bg-[#99D050]/10 border border-[#99D050]/20 px-2 py-0.5 rounded-full">
            {anuncios.length} activos
          </span>
        </div>
        <Button 
          variant="ghost" size="icon" 
          onClick={onRefresh} 
          className="text-slate-400 hover:text-[#99D050] hover:bg-[#99D050]/10 rounded-full transition-colors"
          title="Recargar lista"
        >
          <RotateCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-0 bg-slate-50/30">
        {loading && anuncios.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-sm animate-pulse">Cargando avisos...</div>
        ) : anuncios.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <p className="text-sm font-medium">No hay avisos registrados</p>
          </div>
        ) : (
          <div className="divide-y divide-[#99D050]/10">
            {anuncios.map((anuncio) => (
              <div key={anuncio.id} className="p-4 bg-white hover:bg-[#99D050]/5 transition-colors flex gap-4 group items-center">
                
                <Avatar className="h-11 w-11 border-2 border-[#99D050]/20 shadow-sm shrink-0">
                  <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${anuncio.autor_id}`} />
                  <AvatarFallback className="bg-[#99D050]/20 text-[#99D050]">AD</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-bold text-slate-800 truncate pr-2">{anuncio.titulo}</h4>
                    <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                      {new Date(anuncio.fecha_creacion).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    {anuncio.descripcion}
                  </p>
                </div>

                {/* Botones */}
                <div className="flex items-center gap-1 pl-2">
                  <Button 
                    size="icon" variant="ghost" 
                    className="h-8 w-8 text-slate-400 hover:text-[#99D050] hover:bg-[#99D050]/10 rounded-lg transition-all"
                    onClick={() => onEdit(anuncio)} title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" variant="ghost" 
                    className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all"
                    onClick={() => onView(anuncio)} title="Leer"
                  >
                    <BookOpen className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" variant="ghost" 
                    className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-100 rounded-lg transition-all"
                    onClick={() => onDelete(anuncio.id)} title="Eliminar"
                  >
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