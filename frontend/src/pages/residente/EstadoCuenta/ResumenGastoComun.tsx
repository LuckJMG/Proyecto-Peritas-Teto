// frontend/src/pages/residente/EstadoCuenta/ResumenGastoComun.tsx
import { Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService, fetchWithAuth } from "@/services/authService";

interface GastoComun {
  id: number;
  residente_id: number;
  mes: number;
  anio: number;
  monto_total: number | string;
  estado: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  fecha_pago?: string;
}

export default function ResumenGastoComun() {
  const navigate = useNavigate();
  const [gastoActual, setGastoActual] = useState<GastoComun | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGasto = async () => {
      try {
        const user = authService.getUser();
        if (!user) return;

        // 1. Obtener residente
        const residentesRes = await fetchWithAuth(
          "http://localhost:8000/api/v1/residentes"
        );
        const residentes = await residentesRes.json();
        const residente = residentes.find((r: any) => r.usuario_id === user.id);

        if (!residente) {
          console.error("No se encontró residente para este usuario");
          return;
        }

        // 2. Obtener gastos
        const gastosRes = await fetchWithAuth(
          "http://localhost:8000/api/v1/gastos-comunes"
        );
        const gastos: GastoComun[] = await gastosRes.json();
        const gastosResidente = gastos.filter(
          (g) => g.residente_id === residente.id
        );

        // 3. Obtener el más prioritario
        const pendiente = gastosResidente
          .sort((a, b) => b.anio - a.anio || b.mes - a.mes)
          .find((g) => g.estado === "PENDIENTE" || g.estado === "VENCIDO" || g.estado === "MOROSO");

        setGastoActual(pendiente || gastosResidente[0]);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGasto();
  }, []);

  const handleVerDetalle = () => {
    navigate('/detalle');
  };

  const handlePagarCuenta = () => {
    navigate('/pago');
  };

  const handleVerHistorial = () => {
    navigate('/historial');
  };

  if (loading) return <div className="p-5 text-gray-500">Cargando estado de cuenta...</div>;
  if (!gastoActual) return <div className="p-5 text-gray-500">No hay gastos registrados</div>;

  // Lógica de presentación
  let displayAnio = gastoActual.anio;
  let displayMes = gastoActual.mes;

  if (displayAnio === 0 && gastoActual.fecha_emision) {
    const dateEmision = new Date(gastoActual.fecha_emision);
    displayAnio = dateEmision.getFullYear();
  }

  const meses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];

  const isDateExpired = () => {
    if (!gastoActual.fecha_vencimiento) return false;
    const vencimiento = new Date(gastoActual.fecha_vencimiento);
    const hoy = new Date();
    vencimiento.setHours(0,0,0,0);
    hoy.setHours(0,0,0,0);
    return vencimiento < hoy;
  };

  const mesAtrasado = 
    gastoActual.estado === "VENCIDO" || 
    gastoActual.estado === "MOROSO" ||
    (gastoActual.estado === "PENDIENTE" && isDateExpired());

  return (
    <div className="flex-col items-center p-5 gap-7 bg-white border border-solid border-[#E9F5DB] shadow-[0px_4px_4px_#BBD386] rounded-[20px]">
      <div className="mb-6">
        <div className="text-sm text-gray-500 mb-2 font-medium uppercase tracking-wide">
          {meses[displayMes - 1] || "Mes Desconocido"} {displayAnio}
        </div>
        
        <div className="text-5xl font-['Lato'] font-light text-gray-900 mb-4">
          $ {Number(gastoActual.monto_total).toLocaleString("es-CL")}
        </div>
        
        <div className="flex items-center justify-between">
          <span
            className={`flex items-center gap-2 text-sm font-semibold px-2 py-1 rounded-full ${
              mesAtrasado
                ? "text-red-700 bg-red-50 border border-red-200"
                : "text-green-700 bg-green-50 border border-green-200"
            }`}
          >
            <span className={`h-2 w-2 rounded-full ${mesAtrasado ? "bg-red-500" : "bg-green-500"}`} />
            {mesAtrasado ? "Pago atrasado" : "Al día"}
          </span>
          
          <div className="flex gap-2">
            <button 
              onClick={handleVerDetalle}
              className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Ver Detalle
            </button>
            <button 
              onClick={handlePagarCuenta}
              className="px-4 py-2 bg-[#8BC34A] text-white rounded-lg hover:bg-[#7CB342] transition-colors text-sm font-medium shadow-sm"
            >
              Pagar Cuenta
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm text-gray-600">
            Último pago:{" "}
            <span className="font-medium text-gray-900">
              {gastoActual.fecha_pago
                ? `$${Number(gastoActual.monto_total).toLocaleString("es-CL")}`
                : "N/A"}
            </span>
          </p>
          <p className="text-sm text-gray-600">
            Vencimiento:{" "}
            <span className={`font-medium ${mesAtrasado ? "text-red-600" : "text-gray-900"}`}>
              {gastoActual.fecha_vencimiento
                ? new Date(gastoActual.fecha_vencimiento).toLocaleDateString("es-CL")
                : "N/A"}
            </span>
          </p>
        </div>
        
        <button 
          onClick={handleVerHistorial}
          className="text-sm text-gray-600 hover:text-[#8BC34A] flex items-center gap-2 transition-colors"
        >
          <Calendar className="w-4 h-4" />
          Historial
        </button>
      </div>
    </div>
  );
}
