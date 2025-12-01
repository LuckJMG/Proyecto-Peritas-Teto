// frontend/src/services/pagoService.ts
import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:8000/api/v1";

export type TipoPago = "GASTO_COMUN" | "MULTA" | "RESERVA";
export type MetodoPago = "TRANSFERENCIA" | "TARJETA" | "EFECTIVO" | "WEBPAY" | "KHIPU";
export type EstadoPago = "PENDIENTE" | "APROBADO" | "RECHAZADO" | "REVERSADO";

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
  registrado_por: number;
  detalle?: string;
}

export interface PagoCreate {
  condominio_id: number;
  residente_id?: number; // Opcional porque el backend puede inferirlo del token
  tipo: TipoPago;
  referencia_id: number;
  monto: number;
  metodo_pago: MetodoPago;
  numero_transaccion?: string;
  detalle?: string;
}

export const pagoService = {
  /**
   * Obtiene todos los pagos de un usuario
   */
  async getByUsuario(usuarioId: number): Promise<Pago[]> {
    try {
      // Primero obtener el residente
      const residentesRes = await fetchWithAuth(`${API_URL}/residentes`);
      const residentes = await residentesRes.json();
      const residente = residentes.find((r: any) => r.usuario_id === usuarioId);

      if (!residente) {
        console.warn("No se encontró residente para usuario:", usuarioId);
        return [];
      }

      // Luego obtener los pagos del residente
      const response = await fetchWithAuth(
        `${API_URL}/pagos?residente_id=${residente.id}`
      );
      
      if (!response.ok) {
        throw new Error("Error al obtener pagos");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en getByUsuario:", error);
      throw error;
    }
  },

  /**
   * Crea un nuevo pago (informe manual)
   */
  async create(data: PagoCreate): Promise<Pago> {
    try {
      const response = await fetchWithAuth(`${API_URL}/pagos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al crear pago");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en create:", error);
      throw error;
    }
  },

  /**
   * Obtiene un pago por ID
   */
  async getById(id: number): Promise<Pago> {
    try {
      const response = await fetchWithAuth(`${API_URL}/pagos/${id}`);
      
      if (!response.ok) {
        throw new Error("Pago no encontrado");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en getById:", error);
      throw error;
    }
  },

  /**
   * Obtiene todos los pagos (Para admin)
   */
  async getAll(filters?: { condominio_id?: number; estado_pago?: EstadoPago }): Promise<Pago[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.condominio_id) params.append('condominio_id', filters.condominio_id.toString());
      if (filters?.estado_pago) params.append('estado_pago', filters.estado_pago);

      const response = await fetchWithAuth(`${API_URL}/pagos?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Error al obtener el listado de pagos');
      }
      
      return response.json();
    } catch (error) {
      console.error("Error en getAll:", error);
      throw error;
    }
  },

  /**
   * Actualiza un pago existente
   */
  async update(id: number, data: Partial<PagoCreate>): Promise<Pago> {
    try {
      const response = await fetchWithAuth(`${API_URL}/pagos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al actualizar pago");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en update:", error);
      throw error;
    }
  },

  /**
   * Elimina un pago
   */
  async delete(id: number): Promise<void> {
    try {
      const response = await fetchWithAuth(`${API_URL}/pagos/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Error al eliminar pago");
      }
    } catch (error) {
      console.error("Error en delete:", error);
      throw error;
    }
  },
};