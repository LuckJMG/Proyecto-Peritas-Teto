import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Residente {
  id: number;
  nombre: string;
  apellido: string;
  vivienda_numero: string;
  email: string;
}

export const residenteService = {
  getAll: async () => {
    // Asumimos que existe este endpoint por los archivos que vi del backend
    const response = await axios.get<Residente[]>(`${API_URL}/api/v1/residentes`);
    return response.data;
  }
};