import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { multaService, type Multa } from "@/services/multaService";
import { authService } from "@/services/authService";
import { residenteService } from "@/services/residenteService";

export default function ResumenMultas() {
  const [multas, setMultas] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMultas = async () => {
      try {
        setLoading(true);
        
        const user = authService.getUser();
        
        if (user?.id) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const allResidentes = await residenteService.getAll();
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const miResidente = allResidentes.find((r: any) => r.usuario_id === user.id);

            if (miResidente) {
                const data = await multaService.getAll(miResidente.id);
                // Ordenar por fecha descendente
                const sorted = data.sort((a, b) => {
                    const dateA = a.fecha_emision ? new Date(a.fecha_emision).getTime() : 0;
                    const dateB = b.fecha_emision ? new Date(b.fecha_emision).getTime() : 0;
                    return dateB - dateA;
                });
                setMultas(sorted);
            }
        }
      } catch (error) {
        console.error("Error cargando multas", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMultas();
  }, []);

  if (loading) return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-[300px] flex items-center justify-center text-gray-500">
        Cargando multas...
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Multas Recientes</h2>
        
        {/* --- BOTÓN VER MÁS ESTILIZADO (VERDE SÓLIDO) --- */}
        <Link to="/multas">
            <Button 
                className="bg-[#99D050] hover:bg-[#8bc040] text-white shadow-sm h-8 px-3 text-xs font-semibold"
            >
                Ver más <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Fecha</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Monto</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Causa</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Estado</th>
            </tr>
          </thead>
          <tbody>
            {multas.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500 text-sm">
                  No tienes multas registradas. ¡Felicitaciones!
                </td>
              </tr>
            ) : (
              multas.slice(0, 5).map((multa) => (
                <tr key={multa.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2 text-sm text-gray-900">
                    {multa.fecha_emision ? new Date(multa.fecha_emision).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-900 font-medium">
                    ${multa.monto.toLocaleString("es-CL")}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-600 truncate max-w-[150px]" title={multa.descripcion}>
                    {multa.descripcion}
                  </td>
                  <td className="py-3 px-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                      multa.estado === 'PAGADA' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : multa.estado === 'PENDIENTE' 
                          ? 'bg-red-100 text-red-800 border-red-200' 
                          : 'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                      {multa.estado}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}