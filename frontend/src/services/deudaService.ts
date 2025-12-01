// frontend/src/services/deudaService.ts
import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:8000/api/v1";

export interface DeudaPendiente {
  id: number;
  tipo: "GASTO_COMUN" | "MULTA";
  descripcion: string;
  monto: number;
  fecha_vencimiento?: string;
  estado: string;
}

export const deudaService = {
  /**
   * Obtiene todas las deudas pendientes de un residente
   */
  async getPendientes(usuarioId: number): Promise<DeudaPendiente[]> {
    try {
      // 1. Primero obtener el residente asociado al usuario
      const residentesRes = await fetchWithAuth(`${API_URL}/residentes`);
      const residentes = await residentesRes.json();
      const residente = residentes.find((r: any) => r.usuario_id === usuarioId);

      if (!residente) {
        console.warn("No se encontró residente para usuario:", usuarioId);
        return [];
      }

      const deudas: DeudaPendiente[] = [];

      // 2. Obtener GASTOS COMUNES pendientes
      try {
        const gastosRes = await fetchWithAuth(`${API_URL}/gastos-comunes`);
        const gastos = await gastosRes.json();
        
        const gastosPendientes = gastos.filter(
          (g: any) => 
            g.residente_id === residente.id && 
            (g.estado === "PENDIENTE" || g.estado === "VENCIDO" || g.estado === "MOROSO")
        );

        gastosPendientes.forEach((gc: any) => {
          deudas.push({
            id: gc.id,
            tipo: "GASTO_COMUN",
            descripcion: `Gasto Común ${gc.mes}/${gc.anio}`,
            monto: Number(gc.monto_total),
            fecha_vencimiento: gc.fecha_vencimiento,
            estado: gc.estado
          });
        });
      } catch (error) {
        console.error("Error cargando gastos comunes:", error);
      }

      // 3. Obtener MULTAS pendientes
      try {
        const multasRes = await fetchWithAuth(`${API_URL}/multas?residente_id=${residente.id}`);
        const multas = await multasRes.json();
        
        const multasPendientes = multas.filter(
          (m: any) => m.estado === "PENDIENTE"
        );

        multasPendientes.forEach((multa: any) => {
          deudas.push({
            id: multa.id,
            tipo: "MULTA",
            descripcion: multa.descripcion || "Multa pendiente",
            monto: Number(multa.monto),
            fecha_vencimiento: multa.fecha_emision,
            estado: multa.estado
          });
        });
      } catch (error) {
        console.error("Error cargando multas:", error);
      }

      // Ordenar por fecha de vencimiento (lo más antiguo primero)
      deudas.sort((a, b) => {
        if (!a.fecha_vencimiento) return 1;
        if (!b.fecha_vencimiento) return -1;
        return new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime();
      });

      return deudas;
    } catch (error) {
      console.error("Error obteniendo deudas pendientes:", error);
      return [];
    }
  }
};