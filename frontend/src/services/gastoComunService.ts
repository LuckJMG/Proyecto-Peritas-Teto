// frontend/src/services/gastoComunService.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export interface GastoComun {
  id: number;
  monto: number;
  descripcion: string;
  fecha_emision: string;
  fecha_vencimiento: string;
  estado: 'PAGADO' | 'NO_PAGADO' | 'VENCIDO' | 'PARCIAL';
  condominio_id: number;
  usuario_id?: number; // Dependiendo de tu modelo
}

class GastoComunService {
  private getHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }

  async getAll(): Promise<GastoComun[]> {
    const response = await fetch(`${API_BASE_URL}/gastos-comunes`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Error al obtener gastos comunes: ${response.status}`);
    }

    return await response.json();
  }
}

export const gastoComunService = new GastoComunService();