// frontend/src/services/registroService.ts
import { fetchWithAuth } from './authService';

const API_URL = 'http://localhost:8000/api/v1';

export type TipoEvento = 
  | 'RESERVA'
  | 'ANUNCIO'
  | 'MULTA'
  | 'PAGO'
  | 'EDICION'
  | 'ELIMINACION'
  | 'CREACION'
  | 'OTRO';

export interface Registro {
  id: number;
  usuario_id: number;
  tipo_evento: TipoEvento;
  detalle: string;
  monto?: number;
  condominio_id?: number;
  datos_adicionales?: string;
  fecha_creacion: string;
  usuario_nombre?: string;
  usuario_apellido?: string;
}

export interface RegistroCreate {
  usuario_id: number;
  tipo_evento: TipoEvento;
  detalle: string;
  monto?: number;
  condominio_id?: number;
  datos_adicionales?: string;
}

export const registroService = {
  async getAll(filters?: {
    tipo_evento?: TipoEvento;
    condominio_id?: number;
  }): Promise<Registro[]> {
    const params = new URLSearchParams();
    if (filters?.tipo_evento) params.append('tipo_evento', filters.tipo_evento);
    if (filters?.condominio_id) params.append('condominio_id', filters.condominio_id.toString());
    
    const url = `${API_URL}/registros?${params.toString()}`;
    const response = await fetchWithAuth(url);
    
    if (!response.ok) {
      throw new Error('Error al obtener registros');
    }
    
    return response.json();
  },

  async getById(id: number): Promise<Registro> {
    const response = await fetchWithAuth(`${API_URL}/registros/${id}`);
    
    if (!response.ok) {
      throw new Error('Error al obtener registro');
    }
    
    return response.json();
  },

  async create(data: RegistroCreate): Promise<Registro> {
    const response = await fetchWithAuth(`${API_URL}/registros`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear registro');
    }
    
    return response.json();
  },
};

// Hook para registrar automáticamente acciones
export const useRegistroAutomatico = () => {
  const registrar = async (
    tipo_evento: TipoEvento,
    detalle: string,
    opciones?: {
      monto?: number;
      condominio_id?: number;
      datos_adicionales?: Record<string, any>;
    }
  ) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.id) return;

      await registroService.create({
        usuario_id: user.id,
        tipo_evento,
        detalle,
        monto: opciones?.monto,
        condominio_id: opciones?.condominio_id,
        datos_adicionales: opciones?.datos_adicionales ? JSON.stringify(opciones.datos_adicionales) : undefined,
      });
    } catch (error) {
      console.error('Error al registrar acción:', error);
    }
  };

  return { registrar };
};
