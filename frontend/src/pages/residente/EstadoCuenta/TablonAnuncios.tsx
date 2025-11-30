// frontend/src/pages/residente/EstadoCuenta/TablonAnuncios.tsx
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";


export default function TablonAnuncios() {
  const navigate = useNavigate();

  const avisos = [
    {
      tipo: "Fiestas Patrias",
      descripcion: "Mañana 18:00 hrs",
      icono: "🎉"
    },
    {
      tipo: "Lavadora 2 no funciona",
      descripcion: "Por favor al hogar.",
      icono: "🔧"
    },
    {
      tipo: "Piscina disponible",
      descripcion: "¡Llegó el verano!",
      icono: "🏊"
    },
    {
      tipo: "Reunión de vecinos",
      descripcion: "Jueves 19:00 hrs",
      icono: "👥"
    },
    {
      tipo: "Mantención ascensores",
      descripcion: "Lunes todo el día",
      icono: "⚠️"
    }
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 sticky top-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Avisos</h2>
        <button 
          onClick={() => navigate('/anuncios')}
          className="px-3 py-1 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors text-sm font-medium"
        >
          Ver más
        </button>
      </div>

      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {avisos.map((aviso, index) => (
          <div 
            key={index} 
            className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0 text-xl">
              {aviso.icono}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 mb-1">{aviso.tipo}</h3>
              <p className="text-xs text-gray-600">{aviso.descripcion}</p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}