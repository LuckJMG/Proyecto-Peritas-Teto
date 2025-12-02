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
}

export const gastoComunService = new GastoComunService();
