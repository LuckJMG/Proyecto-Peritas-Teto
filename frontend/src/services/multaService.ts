// frontend/src/services/multaService.ts
import { fetchWithAuth } from "./authService";

const API_URL = "http://localhost:8000/api/v1";

export type TipoMulta = "RETRASO_PAGO" | "INFRAESTRUCTURA" | "RUIDO" | "MASCOTA" | "OTRO";
export type EstadoMulta = "PENDIENTE" | "PAGADA" | "CONDONADA";

export interface Multa {
  id: number;
  residente_id: number;
  condominio_id: number;
  tipo: TipoMulta;
  descripcion: string;
  monto: number;
  estado: EstadoMulta;
  fecha_emision: string;
  fecha_pago?: string;
  motivo_condonacion?: string;
  creado_por: number;
}

export const multaService = {
  /**
   * Obtiene todas las multas de un residente
   */
  async getAll(residenteId?: number): Promise<Multa[]> {
    try {
      const url = residenteId 
        ? `${API_URL}/multas?residente_id=${residenteId}`
        : `${API_URL}/multas`;
      
      const response = await fetchWithAuth(url);
      
      if (!response.ok) {
        throw new Error("Error al obtener multas");
      }

      const multas = await response.json();
      
      // Ordenar por fecha de emisión descendente (más recientes primero)
      return multas.sort((a: Multa, b: Multa) => 
        new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime()
      );
    } catch (error) {
      console.error("Error en getAll:", error);
      throw error;
    }
  },

  /**
   * Obtiene una multa por ID
   */
  async getById(id: number): Promise<Multa> {
    try {
      const response = await fetchWithAuth(`${API_URL}/multas/${id}`);
      
      if (!response.ok) {
        throw new Error("Multa no encontrada");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en getById:", error);
      throw error;
    }
  },

  /**
   * Crea una nueva multa
   */
  async create(multa: Omit<Multa, 'id'>): Promise<Multa> {
    try {
      const response = await fetchWithAuth(`${API_URL}/multas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(multa),
      });
      
      if (!response.ok) {
        throw new Error("Error al crear multa");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error en create:", error);
      throw error;
    }
  },

  /**
   * Procesa multas por atraso
   */
  async procesarAtrasos(adminId: number): Promise<any> {
    try {
      const response = await fetchWithAuth(
        `${API_URL}/multas/procesar-atrasos?admin_id=${adminId}`,
        {
          method: "POST",
        }
      );
      
      if (!response.ok) {
        throw new Error("Error al procesar atrasos");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error en procesarAtrasos:", error);
      throw error;
    }
  },

  /**
   * Actualiza una multa
   */
  async update(id: number, multa: Partial<Multa>): Promise<Multa> {
    try {
      const response = await fetchWithAuth(`${API_URL}/multas/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(multa),
      });
      
      if (!response.ok) {
        throw new Error("Error al actualizar multa");
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error en update:", error);
      throw error;
    }
  },

  /**
   * Elimina una multa
   */
  async delete(id: number): Promise<void> {
    try {
      const response = await fetchWithAuth(`${API_URL}/multas/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Error al eliminar multa");
      }
    } catch (error) {
      console.error("Error en delete:", error);
      throw error;
    }
  },
};