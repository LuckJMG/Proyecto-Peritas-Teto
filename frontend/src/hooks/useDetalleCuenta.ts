import { useState, useEffect } from "react";
import { authService, fetchWithAuth } from "@/services/authService";
import { gastoComunService } from "@/services/gastoComunService";
import { pagoService } from "@/services/pagoService";
import type { Movimiento } from "@/types/movimiento.types";

export function useDetalleCuenta() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [deudaTotal, setDeudaTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetalle = async () => {
    try {
      setLoading(true);
      const user = authService.getUser();
      if (!user) throw new Error("Usuario no autenticado");

      // 1. Obtener ID de Residente
      const resResidentes = await fetchWithAuth("/api/v1/residentes");
      const residentes = await resResidentes.json();
      const miResidente = residentes.find((r: any) => r.usuario_id === user.id);

      if (!miResidente) throw new Error("Perfil de residente no encontrado");

      // 2. Fetch Paralelo usando tus servicios existentes
      const [gastos, pagos] = await Promise.all([
        gastoComunService.getByResidente(miResidente.id),
        pagoService.getByUsuario(miResidente.id)
      ]);

      const listaMovimientos: Movimiento[] = [];

      // 3. Procesar GASTOS
      gastos.forEach(gasto => {
        // A. Cargo Base (Monto Base + Cuota Mantención)
        const montoFijo = Number(gasto.monto_base || 0) + Number(gasto.cuota_mantencion || 0);
        if (montoFijo > 0) {
            listaMovimientos.push({
                id: `GC-${gasto.id}-BASE`,
                fecha: new Date(gasto.fecha_emision),
                tipo: "CARGO",
                categoria: "GASTO_BASE",
                descripcion: `Gasto Común ${gasto.mes}/${gasto.anio}`,
                monto: montoFijo,
                estado: gasto.estado
            });
        }

        // B. Items Variables (Reservas, Multas en observaciones)
        if (Array.isArray(gasto.observaciones)) {
            gasto.observaciones.forEach((obs, idx) => {
                let cat: Movimiento["categoria"] = "OTRO";
                if (obs.tipo === "RESERVA") cat = "RESERVA";
                if (obs.tipo?.includes("MULTA") || obs.tipo?.includes("RUIDO")) cat = "MULTA";

                // Si es negativo es una anulación/reverso -> ABONO
                const esAbono = Number(obs.monto) < 0;

                listaMovimientos.push({
                    id: `GC-${gasto.id}-OBS-${idx}`,
                    fecha: new Date(obs.fecha || gasto.fecha_emision),
                    tipo: esAbono ? "ABONO" : "CARGO",
                    categoria: cat,
                    descripcion: obs.descripcion || "Cargo adicional",
                    monto: Math.abs(Number(obs.monto)),
                    estado: gasto.estado
                });
            });
        }
      });

      // 4. Procesar PAGOS
      pagos.forEach(pago => {
        listaMovimientos.push({
            id: `PAGO-${pago.id}`,
            fecha: new Date(pago.fecha_pago),
            tipo: "ABONO",
            categoria: "PAGO",
            descripcion: `Pago ${pago.metodo_pago}`,
            monto: Number(pago.monto),
            estado: pago.estado_pago
        });
      });

      // 5. Ordenar cronológicamente descendente
      listaMovimientos.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

      // 6. Calcular Saldo/Deuda
      const totalCargos = listaMovimientos
        .filter(m => m.tipo === "CARGO")
        .reduce((sum, m) => sum + m.monto, 0);
      
      const totalAbonos = listaMovimientos
        .filter(m => m.tipo === "ABONO")
        .reduce((sum, m) => sum + m.monto, 0);

      setDeudaTotal(totalCargos - totalAbonos);
      setMovimientos(listaMovimientos);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error cargando detalle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetalle();
  }, []);

  return { movimientos, deudaTotal, loading, error, reload: fetchDetalle };
}
