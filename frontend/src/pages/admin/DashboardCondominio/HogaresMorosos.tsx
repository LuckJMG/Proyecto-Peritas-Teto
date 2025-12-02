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
import { AlertCircle, ChevronDown, Users } from "lucide-react";

interface HogarMoroso {
  nombre: string;
  vivienda: string;
  avatar: string;
  mesesAtraso: number;
  montoDeuda: number;
  residenteId: number;
}

interface HogaresMorososProps {
  customStyle?: string;
  greenColor?: string;
  data?: HogarMoroso[];
}

export function HogaresMorosos({ 
  customStyle, 
  greenColor = "#99D050",
  data = []
}: HogaresMorososProps) {
  
  const finalStyle = customStyle || "border-none bg-white rounded-[24px] shadow-sm";

  // Formatear monto en pesos chilenos
  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(monto);
  };

  // Texto descriptivo del atraso
  const getTextoAtraso = (meses: number) => {
    if (meses === 1) return "1 mes de atraso";
    if (meses < 12) return `${meses} meses de atraso`;
    const anios = Math.floor(meses / 12);
    const mesesRestantes = meses % 12;
    if (mesesRestantes === 0) return `${anios} ${anios === 1 ? 'año' : 'años'} de atraso`;
    return `${anios} ${anios === 1 ? 'año' : 'años'} y ${mesesRestantes} ${mesesRestantes === 1 ? 'mes' : 'meses'} de atraso`;
  };

  // Estado vacío
  if (data.length === 0) {
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
            disabled
          >
            Ver más
          </Button>
        </CardHeader>

        <CardContent className="px-6 pb-6 pt-2 flex-1 flex items-center justify-center">
          <div className="text-center py-8">
            <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-gray-500 font-medium">¡Excelente!</p>
            <p className="text-gray-400 text-sm mt-1">No hay hogares con pagos pendientes</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        <div className="space-y-5 h-full overflow-y-auto pr-2 custom-scrollbar">
          {data.map((hogar) => (
            <div key={hogar.residenteId} className="flex items-start space-x-4">
              
              <Avatar className="h-12 w-12 border-2 border-white shadow-sm mt-1">
                <AvatarImage src={hogar.avatar} alt={hogar.nombre} />
                <AvatarFallback className="bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 text-white font-bold">
                  {hogar.nombre.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="mb-2">
                  <p className="text-sm font-bold text-gray-900 leading-none truncate">
                    {hogar.nombre}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getTextoAtraso(hogar.mesesAtraso)} • Vivienda {hogar.vivienda}
                  </p>
                  <p className="text-xs font-bold text-red-600 mt-1">
                    Deuda: {formatMonto(hogar.montoDeuda)}
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