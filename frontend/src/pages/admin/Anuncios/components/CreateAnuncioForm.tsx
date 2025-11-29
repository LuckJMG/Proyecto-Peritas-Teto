import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { anuncioService } from "@/services/anuncioService";
import { PlusCircle } from "lucide-react";

interface CreateAnuncioFormProps {
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function CreateAnuncioForm({ onSuccess, onError }: CreateAnuncioFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    
    if(!titulo.trim() || !descripcion.trim()) {
      onError("Por favor completa el título y la descripción.");
      return;
    }

    setLoading(true);
    try {
      await anuncioService.create({ titulo, descripcion });
      setTitulo("");
      setDescripcion("");
      onSuccess();
    } catch (error) {
      console.error(error);
      onError("Error al conectar con el servidor. Verifica tu conexión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg shadow-[#99D050]/20 border border-[#99D050]/30 h-full flex flex-col overflow-hidden">
      {/* Header #99D050 */}
      <div className="bg-[#99D050] px-6 py-4 shrink-0">
        <h3 className="font-bold text-white text-base flex items-center gap-2">
           <PlusCircle className="h-5 w-5 text-white" />
           Nuevo Aviso
        </h3>
      </div>
      
      <div className="p-6 flex-1 flex flex-col gap-5 overflow-y-auto">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[#99D050] uppercase tracking-wide">Título</label>
          <Input 
            placeholder="Ej: Reunión de Asamblea"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className="bg-[#99D050]/5 border-[#99D050]/20 focus:border-[#99D050] focus:ring-[#99D050]/20 transition-all font-medium text-slate-700"
          />
        </div>
        
        <div className="space-y-2 flex-1 flex flex-col">
          <label className="text-xs font-bold text-[#99D050] uppercase tracking-wide">Contenido</label>
          <Textarea
            placeholder="Describe los detalles del aviso..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="bg-[#99D050]/5 border-[#99D050]/20 focus:border-[#99D050] focus:ring-[#99D050]/20 transition-all flex-1 min-h-[100px] resize-none p-4 leading-relaxed text-slate-600"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={loading}
          className="w-full bg-[#99D050] hover:bg-[#86b845] text-white font-bold py-6 shadow-md shadow-[#99D050]/30 hover:shadow-lg transition-all mt-auto rounded-xl"
        >
          {loading ? "PUBLICANDO..." : "PUBLICAR AVISO"}
        </Button>
      </div>
    </div>
  );
}