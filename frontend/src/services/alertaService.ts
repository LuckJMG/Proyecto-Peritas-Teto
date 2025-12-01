import axios from 'axios';

// Ajusta esta URL base según tu configuración, por defecto suele ser localhost:8000/api/v1
const API_URL = "http://localhost:8000/api/v1/alertas"; 

export interface Alerta {
  id: number;
  titulo: string;
  descripcion: string;
  tipo: "MOROSIDAD" | "MULTA" | "EDICION_GASTO" | "SISTEMA";
  estado: "PENDIENTE" | "RESUELTO";
  fecha_creacion: string;
  comentario_resolucion?: string;
  fecha_resolucion?: string;
}

export const alertaService = {
  getAll: async (estado?: string) => {
    const params = estado ? { estado } : {};
    const response = await axios.get<Alerta[]>(API_URL, { params });
    return response.data;
  },

  resolver: async (id: number, comentario: string) => {
    const response = await axios.put<Alerta>(`${API_URL}/${id}/resolver`, null, {
      params: { comentario }
    });
    return response.data;
  }
};