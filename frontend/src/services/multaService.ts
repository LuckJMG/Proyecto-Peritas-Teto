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

/**
 * Payload para crear una multa manual.
 * Más seguro que usar Omit<Multa, 'id'>.
 */
export interface MultaCreate {
  residente_id: number;
  condominio_id: number;
  tipo: TipoMulta;
  descripcion: string;
  monto: number;
  creado_por: number;
}

export const multaService = {
  /**
   * Obtiene todas las multas (global o por residente)
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

      return multas.sort(
        (a: Multa, b: Multa) =>
          new Date(b.fecha_emision).getTime() - new Date(a.fecha_emision).getTime()
      );
    } catch (error) {
      console.error("Error en multaService.getAll:", error);
      return [];
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
      console.error("Error en multaService.getById:", error);
      throw error;
    }
  },

  /**
   * Crea una multa manual
   */
  async create(multa: MultaCreate): Promise<Multa> {
    try {
      const response = await fetchWithAuth(`${API_URL}/multas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(multa),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Error al crear multa");
      }

      return await response.json();
    } catch (error) {
      console.error("Error en multaService.create:", error);
      throw error;
    }
  },

  /**
   * Procesa multas automáticas por atraso
   */
  async procesarAtrasos(adminId: number): Promise<{
    message: string;
    gastos_vencidos_detectados: number;
    multas_creadas: number;
  }> {
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
      console.error("Error en multaService.procesarAtrasos:", error);
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
      console.error("Error en multaService.update:", error);
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
      console.error("Error en multaService.delete:", error);
      throw error;
    }
  },

  /**
   * Obtiene multas por condominio
   */
  async getByCondominio(condominioId: number): Promise<Multa[]> {
    try {
      const todas = await this.getAll();
      return todas.filter(m => m.condominio_id === condominioId);
    } catch (error) {
      console.error("Error en multaService.getByCondominio:", error);
      return [];
    }
  },

  /**
   * Obtiene multas pendientes de un condominio
   */
  async getPendientesByCondominio(condominioId: number): Promise<Multa[]> {
    try {
      const multas = await this.getByCondominio(condominioId);
      return multas.filter(m => m.estado === "PENDIENTE");
    } catch (error) {
      console.error("Error en multaService.getPendientesByCondominio:", error);
      return [];
    }
  },

  async ajustar(multaId: number, payload: {
    nuevo_monto: number;
    motivo: string;
    es_condonacion?: boolean;
    usuario_id: number;
  }): Promise<Multa> {
    const response = await fetchWithAuth(`${API_URL}/multas/${multaId}/ajustar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al ajustar multa");
    }
    return await response.json();
  },

  async revertir(multaId: number, payload: {
    registro_id: number;
    motivo: string;
    usuario_id: number;
  }): Promise<Multa> {
    const response = await fetchWithAuth(`${API_URL}/multas/${multaId}/revertir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Error al revertir multa");
    }
    return await response.json();
  },
};
