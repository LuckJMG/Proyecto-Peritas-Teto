import { useEffect, useState } from "react";
// Se eliminó la importación de useNavigate porque ya no se usa
import { multaService, type Multa } from "@/services/multaService";

export default function ResumenMultas() {
  // Se eliminó const navigate = useNavigate();
  const [multas, setMultas] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(true);

  // ID hardcoded para demo
  const residenteId = 1; 

  useEffect(() => {
    loadMultas();
  }, []);

  const loadMultas = async () => {
    try {
      const data = await multaService.getAll(residenteId);
      // Filtramos las últimas 5 o las pendientes
      setMultas(data);
    } catch (error) {
      console.error("Error cargando multas", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Cargando multas...</div>;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Multas Recientes</h2>
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
                <td colSpan={4} className="text-center py-8 text-gray-500">
                  No tienes multas registradas
                </td>
              </tr>
            ) : (
              multas.slice(0, 5).map((multa) => (
                <tr key={multa.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2 text-sm text-gray-900">{multa.fecha_emision}</td>
                  <td className="py-3 px-2 text-sm text-gray-900 font-medium">${multa.monto}</td>
                  <td className="py-3 px-2 text-sm text-gray-600">{multa.descripcion}</td>
                  <td className="py-3 px-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      multa.estado === 'PAGADA' ? 'bg-green-100 text-green-800' :
                      multa.estado === 'PENDIENTE' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
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