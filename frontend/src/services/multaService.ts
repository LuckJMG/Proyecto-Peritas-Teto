import axios from 'axios';

// Asumiendo que VITE_API_URL está configurado, si no, poner localhost hardcoded
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Multa {
  id?: number;
  residente_id: number;
  condominio_id: number;
  tipo: 'RETRASO_PAGO' | 'INFRAESTRUCTURA' | 'RUIDO' | 'MASCOTA' | 'OTRO';
  descripcion: string;
  monto: number;
  estado: 'PENDIENTE' | 'PAGADA' | 'CONDONADA';
  fecha_emision?: string;
  fecha_pago?: string;
  motivo_condonacion?: string;
  creado_por: number;
}

export const multaService = {
  getAll: async (residenteId?: number) => {
    const params = residenteId ? { residente_id: residenteId } : {};
    const response = await axios.get<Multa[]>(`${API_URL}/api/v1/multas`, { params });
    return response.data;
  },

  create: async (multa: Multa) => {
    const response = await axios.post<Multa>(`${API_URL}/api/v1/multas`, multa);
    return response.data;
  },

  procesarAtrasos: async (adminId: number) => {
    const response = await axios.post(`${API_URL}/api/v1/multas/procesar-atrasos`, null, {
      params: { admin_id: adminId }
    });
    return response.data;
  },

  update: async (id: number, multa: Partial<Multa>) => {
    const response = await axios.put<Multa>(`${API_URL}/api/v1/multas/${id}`, multa);
    return response.data;
  },

  delete: async (id: number) => {
    await axios.delete(`${API_URL}/api/v1/multas/${id}`);
  }
};