// frontend/src/services/espaciosComunesService.ts

export interface EspacioComun {
  id: number;
  condominioId: number;
  nombre: string;
  tipo: 'ESTACIONAMIENTO' | 'QUINCHO' | 'MULTICANCHA' | 'SALA_EVENTOS';
  capacidad: number;
  costoPorHora: number | null;
  descripcion: string;
  activo: boolean;
  requierePago: boolean;
}

export interface EspacioComunInput {
  condominioId: number;
  nombre: string;
  tipo: 'ESTACIONAMIENTO' | 'QUINCHO' | 'MULTICANCHA' | 'SALA_EVENTOS';
  capacidad: number;
  costoPorHora?: number | null;
  descripcion?: string;
  requierePago: boolean;
}

class EspaciosComunesService {
  private baseUrl = '/api/espacios-comunes';

  async getByCondominio(condominioId: number): Promise<EspacioComun[]> {
    const response = await fetch(`${this.baseUrl}?condominioId=${condominioId}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar espacios comunes');
    }
    
    return response.json();
  }

  async getById(espacioComunId: number): Promise<EspacioComun> {
    const response = await fetch(`${this.baseUrl}/${espacioComunId}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar espacio común');
    }
    
    return response.json();
  }

  async create(data: EspacioComunInput): Promise<EspacioComun> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear espacio común');
    }
    
    return response.json();
  }

  async update(espacioComunId: number, data: Partial<EspacioComunInput>): Promise<EspacioComun> {
    const response = await fetch(`${this.baseUrl}/${espacioComunId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar espacio común');
    }
    
    return response.json();
  }

  async delete(espacioComunId: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${espacioComunId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar espacio común');
    }
  }

  async getByTipo(
    condominioId: number, 
    tipo: EspacioComun['tipo']
  ): Promise<EspacioComun[]> {
    const response = await fetch(`${this.baseUrl}?condominioId=${condominioId}&tipo=${tipo}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar espacios comunes');
    }
    
    return response.json();
  }

  async getDisponibles(condominioId: number): Promise<EspacioComun[]> {
    const response = await fetch(`${this.baseUrl}?condominioId=${condominioId}&disponible=true`);
    
    if (!response.ok) {
      throw new Error('Error al cargar espacios disponibles');
    }
    
    return response.json();
  }
}

export const espaciosComunesService = new EspaciosComunesService();
