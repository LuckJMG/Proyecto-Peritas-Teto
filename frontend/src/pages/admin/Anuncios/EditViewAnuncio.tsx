import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { anuncioService } from "@/services/anuncioService";
import { X, BookOpen } from "lucide-react";

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

interface EditViewAnuncioProps {
  anuncio: AnuncioConAutor | null;
  mode: "edit" | "view" | null;
  onClose: () => void;
  onUpdate: () => void;
  onError: (msg: string) => void;
}

export function EditViewAnuncio({ anuncio, mode, onClose, onUpdate, onError }: EditViewAnuncioProps) {
  const [titulo, setTitulo] = useState("");
  const [contenido, setContenido] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (anuncio) {
      setTitulo(anuncio.titulo || "");
      setContenido(anuncio.contenido || "");
    } else {
      setTitulo("");
      setContenido("");
    }
  }, [anuncio]);

  const isView = mode === "view";
  const isEdit = mode === "edit";

  const handleUpdate = async () => {
    if (!anuncio) return;
    
    if (!titulo.trim() || !contenido.trim()) {
      onError("Por favor completa el título y el contenido.");
      return;
    }
    
    setLoading(true);
    try {
      await anuncioService.update(anuncio.id, { titulo, contenido });
      onUpdate();
      onClose();
    } catch (error) {
      console.error(error);
      onError("No se pudo actualizar el aviso.");
    } finally {
      setLoading(false);
    }
  };

  if (!anuncio || !mode) {
    return (
      <div className="h-full w-full bg-white border border-[#99D050]/30 rounded-2xl flex items-center justify-center shadow-lg shadow-[#99D050]/10">
        <div className="text-center p-6 opacity-50">
          <div className="bg-[#99D050]/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-[#99D050]" />
          </div>
          <p className="font-medium text-slate-400">Selecciona un aviso para ver detalles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-[#99D050]/20 border border-[#99D050]/30 h-full flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className={`px-6 py-3 shrink-0 flex justify-between items-center border-b ${isEdit ? 'bg-amber-50 border-amber-100' : 'bg-[#99D050]/10 border-[#99D050]/20'}`}>
        <h3 className={`font-bold text-sm uppercase tracking-wider flex items-center gap-2 ${isEdit ? 'text-amber-700' : 'text-[#99D050]'}`}>
          {isEdit ? "Modo Edición" : "Modo Lectura"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 rounded-full hover:bg-black/5">
          <X className="h-4 w-4 text-slate-500" />
        </Button>
      </div>

      <div className="p-6 flex-1 flex gap-8 overflow-hidden">
        <div className="flex-1 flex flex-col gap-5 h-full overflow-y-auto">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Título</label>
            <Input 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              disabled={isView}
              className={`font-bold text-xl h-auto py-2 ${isView ? 'bg-transparent border-none px-0 shadow-none text-slate-900' : 'bg-[#99D050]/5 border-[#99D050]/20'}`}
            />
          </div>
          
          <div className="space-y-2 flex-1 flex flex-col">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Contenido</label>
            <Textarea
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              disabled={isView}
              className={`flex-1 resize-none text-base leading-relaxed p-4 ${isView ? 'bg-transparent border-none px-0 shadow-none text-slate-600' : 'bg-[#99D050]/5 border-[#99D050]/20'}`}
            />
          </div>
        </div>

        <div className="w-72 border-l border-slate-100 pl-8 flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto pt-2">
            <div className="bg-slate-50 p-4 rounded-xl space-y-3">
               <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">ID Ref</span>
                  <p className="font-mono text-xs text-slate-600">#{anuncio.id}</p>
               </div>
               <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fecha</span>
                  <p className="text-sm font-medium text-slate-700">
                    {new Date(anuncio.fecha_publicacion).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
               </div>
               <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Autor</span>
                  <div className="flex items-center gap-2">
                     <Avatar className="h-6 w-6 border border-slate-200">
                        <AvatarImage src={anuncio.avatarAutor} alt={anuncio.nombreAutor} />
                        <AvatarFallback className="bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 text-white text-[10px] font-bold">
                          {anuncio.nombreAutor.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                     </Avatar>
                     <p className="text-xs font-medium text-slate-700">{anuncio.nombreAutor}</p>
                  </div>
               </div>
            </div>
          </div>

          <div className="shrink-0 pt-4 pb-1 space-y-3 border-t border-slate-100 mt-2">
            {isEdit ? (
              <>
                <Button onClick={handleUpdate} disabled={loading} className="w-full bg-[#99D050] hover:bg-[#86b845] text-white shadow-md shadow-[#99D050]/30">
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </Button>
                <Button variant="outline" onClick={onClose} className="w-full">
                  Cancelar
                </Button>
              </>
            ) : (
               <div className="text-center">
                  <p className="text-xs text-slate-400 mb-2">Solo lectura</p>
                  <Button variant="outline" onClick={onClose} className="w-full border-slate-200">
                    Cerrar Panel
                  </Button>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}