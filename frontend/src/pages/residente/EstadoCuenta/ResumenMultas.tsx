// frontend/src/pages/residente/EstadoCuenta/ResumenMultas.tsx
import { useNavigate } from "react-router-dom";

export default function ResumenMultas() {
  const navigate = useNavigate();

  const multas = [
    {
      fecha: "13/08/2025",
      monto: "$20.000",
      causa: "Ruido excesivo en horario de descanso."
    },
    {
      fecha: "15/07/2025",
      monto: "$15.000",
      causa: "Uso indebido de espacios comunes."
    },
    {
      fecha: "20/06/2025",
      monto: "$10.000",
      causa: "Estacionamiento en lugar no autorizado."
    },
    {
      fecha: "05/05/2025",
      monto: "$25.000",
      causa: "Falta de aseo en área común."
    }
  ];

  const handleVerMas = () => {
    navigate('/multas');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Multas</h2>
        <button 
          onClick={handleVerMas}
          className="px-4 py-2 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors text-sm font-medium"
        >
          Ver Más
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Fecha</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Monto</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-700">Causa</th>
            </tr>
          </thead>
          <tbody>
            {multas.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-8 text-gray-500">
                  No tienes multas registradas
                </td>
              </tr>
            ) : (
              multas.map((multa, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-2 text-sm text-gray-900">{multa.fecha}</td>
                  <td className="py-3 px-2 text-sm text-gray-900 font-medium">{multa.monto}</td>
                  <td className="py-3 px-2 text-sm text-gray-600">{multa.causa}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}