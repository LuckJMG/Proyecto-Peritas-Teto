import { fetchWithAuth } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export type EstadoPago = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'REVERSADO';
export type MetodoPago = 'TRANSFERENCIA' | 'TARJETA' | 'EFECTIVO' | 'WEBPAY' | 'KHIPU';
export type TipoPago = 'GASTO_COMUN' | 'MULTA' | 'RESERVA';

export interface Pago {
  id: number;
  condominio_id: number;
  residente_id: number;
  tipo: TipoPago;
  referencia_id: number;
  monto: number;
  metodo_pago: MetodoPago;
  estado_pago: EstadoPago;
  numero_transaccion?: string;
  fecha_pago: string;
  comprobante_url?: string;
  detalle?: string; // Agregado para compatibilidad con HistorialPagos.tsx
  registrado_por: number;
}

export interface CrearPagoDTO {
  condominio_id: number;
  residente_id: number;
  tipo: TipoPago;
  referencia_id: number;
  monto: number;
  metodo_pago: MetodoPago;
  numero_transaccion?: string;
  detalle?: string; // Agregado para compatibilidad con IngresarPagoDialog.tsx
}

export const pagoService = {
  /**
   * Obtiene todos los pagos (Para el Dashboard de Admin)
   * Soporta filtros opcionales
   */
  async getAll(filters?: { condominio_id?: number; estado_pago?: EstadoPago }): Promise<Pago[]> {
    const params = new URLSearchParams();
    if (filters?.condominio_id) params.append('condominio_id', filters.condominio_id.toString());
    if (filters?.estado_pago) params.append('estado_pago', filters.estado_pago);

    const response = await fetchWithAuth(`${API_URL}/pagos?${params.toString()}`);
    if (!response.ok) throw new Error('Error al obtener el listado de pagos');
    return response.json();
  },

  /**
   * Obtiene pagos de un residente específico
   */
  async getByUsuario(residenteId: number): Promise<Pago[]> {
    const response = await fetchWithAuth(`${API_URL}/pagos?residente_id=${residenteId}`);
    if (!response.ok) throw new Error('Error al obtener pagos del residente');
    return response.json();
  },

  /**
   * Crea un nuevo pago
   */
  async create(data: CrearPagoDTO): Promise<Pago> {
    const response = await fetchWithAuth(`${API_URL}/pagos`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al registrar el pago');
    return response.json();
  }
};