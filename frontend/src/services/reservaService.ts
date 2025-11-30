import { fetchWithAuth } from "./authService";

const API_BASE_URL = "http://localhost:8000/api/v1";

export interface Reserva {
  id: number;
  residente_id: number;
  espacio_comun_id: number;
  fecha_reserva: string;
  hora_inicio: string;
  hora_fin: string;
  estado: string;
  observaciones?: string;
  monto_pago?: number;
  pago_id?: number;
}

export interface ReservaCreate {
  residente_id: number;
  espacio_comun_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  cantidad_personas: number;
  es_evento_comunidad?: boolean; // Nuevo campo opcional
  observaciones?: string;
}

class ReservaService {
  async getAll(): Promise<Reserva[]> {
    const res = await fetchWithAuth(`${API_BASE_URL}/reservas`);
    if (!res.ok) throw new Error(`Error: ${res.status}`);
    return res.json();
  }

  async getById(id: number): Promise<Reserva> {
    const res = await fetchWithAuth(`${API_BASE_URL}/reservas/${id}`);
    if (!res.ok) throw new Error(`Error: ${res.status}`);
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
    if (!res.ok) throw new Error(`Error: ${res.status}`);
  }
}

export const reservaService = new ReservaService();
