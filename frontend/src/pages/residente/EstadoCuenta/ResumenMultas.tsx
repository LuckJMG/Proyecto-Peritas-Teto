import { useEffect, useState } from "react";
import { multaService, type Multa } from "@/services/multaService";
import { authService } from "@/services/authService";
import { residenteService } from "@/services/residenteService"; // Importamos el servicio de residentes

export default function ResumenMultas() {
  const [multas, setMultas] = useState<Multa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMultas = async () => {
      try {
        setLoading(true);
        
        // 1. Obtener usuario logueado
        const user = authService.getUser();
        
        if (user?.id) {
            // 2. Buscar el perfil de residente asociado a este usuario
            // Nota: Hacemos esto porque 'user' es la cuenta de acceso, pero las multas están ligadas al 'residente'
            const allResidentes = await residenteService.getAll();
            
            // Buscamos el residente que tenga el mismo usuario_id
            // Usamos (r: any) por seguridad si tu interfaz Residente no tiene tipado 'usuario_id' aún
            const miResidente = allResidentes.find((r: any) => r.usuario_id === user.id);

            if (miResidente) {
                // 3. Ahora sí cargamos las multas de este residente específico
                const data = await multaService.getAll(miResidente.id);
                setMultas(data);
            } else {
                console.warn("Este usuario no tiene un perfil de residente asociado.");
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
                  <td className="py-3 px-2 text-sm text-gray-900">
                    {multa.fecha_emision ? new Date(multa.fecha_emision).toLocaleDateString() : "-"}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-900 font-medium">
                    ${multa.monto.toLocaleString("es-CL")}
                  </td>
                  <td className="py-3 px-2 text-sm text-gray-600 truncate max-w-[200px]" title={multa.descripcion}>
                    {multa.descripcion}
                  </td>
                  <td className="py-3 px-2 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${
                      multa.estado === 'PAGADA' 
                        ? 'bg-green-100 text-green-800 border-green-200' 
                        : multa.estado === 'PENDIENTE' 
                          ? 'bg-red-100 text-red-800 border-red-200' 
                          : 'bg-gray-100 text-gray-800 border-gray-200'
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