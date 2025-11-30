import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, ChevronDown } from "lucide-react";

// Recibimos props para mantener consistencia de estilo
export function HogaresMorosos({ customStyle, greenColor = "#99D050" }: { customStyle?: string, greenColor?: string }) {
  
  const morosos = [
    { nombre: "Cecilia Immergreen", atraso: "10 meses de atraso", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Cecilia" },
    { nombre: "Immer Plush", atraso: "8 meses de atraso", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Plush" },
    { nombre: "Noah O'Connor", atraso: "5 meses de atraso", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Noah" },
    { nombre: "Zoe Lee", atraso: "3 meses de atraso", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe" },
    { nombre: "Aria Stark", atraso: "2 meses de atraso", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria" },
  ];

  // Estilo por defecto si no se pasa prop (backup)
  const finalStyle = customStyle || "border-none bg-white rounded-[24px] shadow-sm";

  return (
    <Card className={`${finalStyle} h-full flex flex-col`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 pt-6 px-6 shrink-0">
        <CardTitle className="text-lg font-bold text-gray-900">
          Hogares Impagos
        </CardTitle>
        <Button 
          size="sm" 
          className="text-white font-bold h-7 rounded-md px-3 text-xs shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: greenColor }}
        >
          Ver más
        </Button>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-2 flex-1 overflow-hidden">
        {/* Scroll interno si la lista es muy larga, pero ocultamos la barra visualmente si prefieres */}
        <div className="space-y-5 h-full overflow-y-auto pr-2 custom-scrollbar">
          {morosos.map((item, index) => (
            <div key={index} className="flex items-start space-x-4">
              
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm mt-1">
                <AvatarImage src={item.avatar} alt={item.nombre} />
                <AvatarFallback>User</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <p className="text-sm font-bold text-gray-900 leading-none truncate">
                    {item.nombre}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {item.atraso}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-7 rounded-full border-gray-300 text-gray-600 hover:text-gray-900 hover:bg-gray-50 px-3 text-[10px] font-semibold tracking-wide uppercase"
                  >
                    <AlertCircle className="mr-1.5 h-3 w-3" />
                    Notificar
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-7 w-7 rounded-full border-gray-300 text-gray-500 hover:text-gray-900"
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}