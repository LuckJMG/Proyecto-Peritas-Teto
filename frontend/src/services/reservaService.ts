import { fetchWithAuth } from "./authService";

const API_BASE_URL = "http://localhost:8000/api/v1";

export interface Reserva {
  id: number;
  residente_id: number;
  espacio_comun_id: number;
  fecha_inicio: string; // ISO 8601
  fecha_fin: string;    // ISO 8601
  estado: string;
  cantidad_personas: number;
}

export interface ReservaCreate {
  residente_id: number;
  espacio_comun_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  cantidad_personas: number;
}

class ReservaService {
  async getAll(): Promise<Reserva[]> {
    const res = await fetchWithAuth(`${API_BASE_URL}/reservas`);
    if (!res.ok) {
      throw new Error(`Error al obtener reservas: ${res.status}`);
    }
    return res.json();
  }

  async getById(id: number): Promise<Reserva> {
    const res = await fetchWithAuth(`${API_BASE_URL}/reservas/${id}`);
    if (!res.ok) {
      throw new Error(`Error al obtener reserva ${id}: ${res.status}`);
    }
    return res.json();
  }

  async create(data: ReservaCreate): Promise<Reserva> {
    const res = await fetchWithAuth(`${API_BASE_URL}/reservas`, {
      method: "POST",
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Error al crear reserva: ${res.status}`);
    }
    return res.json();
  }

  async delete(id: number): Promise<void> {
    const res = await fetchWithAuth(`${API_BASE_URL}/reservas/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error(`Error al eliminar reserva: ${res.status}`);
    }
  }
}

export const reservaService = new ReservaService();
