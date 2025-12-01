const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

export interface Residente {
  id: number;
  usuario_id: number;      
  condominio_id: number;
  nombre: string;
  apellido: string;
  rut: string;             
  email: string;
  telefono?: string;      
  vivienda_numero: string;
  es_propietario: boolean; 
}

class ResidenteService {
  private getHeaders() {
     const token = localStorage.getItem("accessToken");
     return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
     };
  }

  async getAll(): Promise<Residente[]> {
    const res = await fetch(`${API_BASE_URL}/residentes`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Error al obtener residentes: ${res.status}`);
    }
    return res.json();
  }
}

export const residenteService = new ResidenteService();