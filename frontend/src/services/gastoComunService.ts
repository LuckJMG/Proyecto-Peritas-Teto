import { fetchWithAuth } from "./authService";

const API_BASE_URL = "/api/v1";

export interface GastoComun {
  id: number;
  residente_id: number;
  condominio_id: number;
  mes: number;
  anio: number;

  // Montos Desglosados
  monto_base: number;
  cuota_mantencion: number;
  servicios: number;
  multas: number;
  monto_total: number;

  // Estado y Fechas
  estado: "PENDIENTE" | "PAGADO" | "VENCIDO" | "MOROSO";
  fecha_emision: string;
  fecha_vencimiento: string;
  fecha_pago?: string;

  // Detalle de cobros adicionales
  observaciones: Array<{
    tipo: string;
    descripcion: string;
    monto: number;
    fecha: string;
  }>;
}

class GastoComunService {
  async getAll(): Promise<GastoComun[]> {
    const response = await fetchWithAuth(`${API_BASE_URL}/gastos-comunes`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener gastos comunes: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Obtiene los gastos de un residente específico.
   * Filtra en el cliente si el backend no soporta ?residente_id
   */
  async getByResidente(residenteId: number): Promise<GastoComun[]> {
    const all = await this.getAll();
    return all.filter(g => g.residente_id === residenteId);
  }

  async ajustar(gastoId: number, payload: {
    nuevo_monto: number;
    motivo: string;
    es_condonacion?: boolean;
    usuario_id: number;
  }): Promise<GastoComun> {
    const response = await fetchWithAuth(`${API_BASE_URL}/gastos-comunes/${gastoId}/ajustar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al ajustar gasto común');
    }
    return await response.json();
  }

  async revertir(gastoId: number, payload: {
    registro_id: number;
    motivo: string;
    usuario_id: number;
  }): Promise<GastoComun> {
    const response = await fetchWithAuth(`${API_BASE_URL}/gastos-comunes/${gastoId}/revertir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Error al revertir ajuste de gasto común');
    }
    return await response.json();
  }
}

export const gastoComunService = new GastoComunService();
