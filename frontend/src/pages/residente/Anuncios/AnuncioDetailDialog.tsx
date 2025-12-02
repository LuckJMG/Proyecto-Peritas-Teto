import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Anuncio } from "@/types/anuncio.types";

interface AnuncioDetailDialogProps {
  anuncio: Anuncio | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnuncioDetailDialog({ anuncio, open, onOpenChange }: AnuncioDetailDialogProps) {
  if (!anuncio) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="secondary" className="bg-[#99D050]/20 text-green-800 hover:bg-[#99D050]/30 border-0">
              Comunicado Oficial
            </Badge>
          </div>
          <DialogTitle className="text-2xl font-bold text-gray-900 leading-tight">
            {anuncio.titulo}
          </DialogTitle>
          
          <div className="flex items-center gap-4 text-sm text-gray-500 mt-2 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {new Date(anuncio.fecha_publicacion).toLocaleDateString("es-CL", {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
            {/* Si tu backend envía el nombre del creador, podrías mostrarlo aquí */}
            <div className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Administración</span>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
          {anuncio.contenido}
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="bg-gray-900 text-white hover:bg-gray-800">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}