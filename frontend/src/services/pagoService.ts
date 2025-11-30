import { fetchWithAuth } from './authService';

const API_URL = 'http://localhost:8000/api/v1';

export type EstadoPago = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO' | 'REVERSADO';
export type MetodoPago = 'TRANSFERENCIA' | 'WEBPAY' | 'EFECTIVO' | 'OTRO';
export type TipoPago = 'GASTO_COMUN' | 'RESERVA' | 'MULTA';

export interface Pago {
  id: number;
  monto: number;
  fecha_pago: string;
  estado_pago: EstadoPago;
  metodo_pago: MetodoPago;
  tipo: TipoPago;
  detalle?: string;
  registrado_por: number;
  numero_transaccion?: string; // Nuevo campo
}

export interface CrearPagoDTO {
  condominio_id: number;
  residente_id: number;
  tipo: TipoPago;
  referencia_id: number; // ID del gasto comun o multa
  monto: number;
  metodo_pago: MetodoPago;
  numero_transaccion?: string;
  detalle?: string;
}

export const pagoService = {
  async getByUsuario(usuarioId: number): Promise<Pago[]> {
    // Ajusta según tu backend (si usa residente_id o usuario_id)
    const response = await fetchWithAuth(`${API_URL}/pagos?residente_id=${usuarioId}`);
    if (!response.ok) throw new Error('Error al obtener pagos');
    return response.json();
  },

  async create(data: CrearPagoDTO): Promise<Pago> {
    const response = await fetchWithAuth(`${API_URL}/pagos`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Error al registrar el pago');
    return response.json();
  }
};