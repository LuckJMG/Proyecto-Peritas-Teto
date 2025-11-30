import { fetchWithAuth } from './authService';

const API_URL = 'http://localhost:8000/api/v1';

export interface DeudaPendiente {
  id: number;
  tipo: 'GASTO_COMUN' | 'MULTA';
  descripcion: string;
  monto: number;
  fecha_vencimiento: string;
}

export const deudaService = {
  async getPendientes(residenteId: number): Promise<DeudaPendiente[]> {
    try {
      // 1. Obtener Gastos Comunes NO PAGADOS
      const resGastos = await fetchWithAuth(`${API_URL}/gastos_comunes?residente_id=${residenteId}&estado_pago=PENDIENTE`);
      const gastos = resGastos.ok ? await resGastos.json() : [];

      // 2. Obtener Multas NO PAGADAS
      const resMultas = await fetchWithAuth(`${API_URL}/multas?residente_id=${residenteId}&pagada=false`);
      const multas = resMultas.ok ? await resMultas.json() : [];

      // 3. Unificar formato
      const listaGastos = gastos.map((g: any) => ({
        id: g.id,
        tipo: 'GASTO_COMUN',
        descripcion: `Gasto Común ${g.periodo || 'Mensual'}`,
        monto: g.monto,
        fecha_vencimiento: g.fecha_vencimiento
      }));

      const listaMultas = multas.map((m: any) => ({
        id: m.id,
        tipo: 'MULTA',
        descripcion: `Multa: ${m.motivo || 'General'}`,
        monto: m.monto,
        fecha_vencimiento: m.fecha_incidente // O fecha creación
      }));

      return [...listaGastos, ...listaMultas];
    } catch (error) {
      console.error("Error cargando deudas", error);
      return [];
    }
  }
};