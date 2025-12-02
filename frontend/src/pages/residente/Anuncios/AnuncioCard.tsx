import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight } from "lucide-react";
import type { Anuncio } from "@/types/anuncio.types";

interface AnuncioCardProps {
  anuncio: Anuncio;
  onClick: (anuncio: Anuncio) => void;
}

export function AnuncioCard({ anuncio, onClick }: AnuncioCardProps) {
  // Función para truncar texto
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <Card className="hover:shadow-md transition-all duration-200 border-gray-200 group flex flex-col h-full">
      <CardHeader className="pb-3 space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5 text-[#99D050]" />
          <span className="font-medium">
            {new Date(anuncio.fecha_publicacion).toLocaleDateString("es-CL", {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </span>
        </div>
        <h3 className="font-bold text-lg text-gray-900 group-hover:text-[#99D050] transition-colors line-clamp-2">
          {anuncio.titulo}
        </h3>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-sm text-gray-600 leading-relaxed">
          {truncateText(anuncio.contenido, 120)}
        </p>
      </CardContent>

      <CardFooter className="pt-2 border-t border-gray-50 bg-gray-50/50">
        <Button 
          variant="ghost" 
          className="w-full justify-between text-[#99D050] hover:text-[#8bc040] hover:bg-transparent p-0 font-medium h-auto"
          onClick={() => onClick(anuncio)}
        >
          Leer comunicado completo
          <ChevronRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
        </Button>
      </CardFooter>
    </Card>
  );
}