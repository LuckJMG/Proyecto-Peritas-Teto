export interface EspacioComun {
  id: number;
  condominio_id: number;
  nombre: string;
  tipo: 'ESTACIONAMIENTO' | 'QUINCHO' | 'MULTICANCHA' | 'SALA_EVENTOS';
  capacidad: number;
  costo_por_hora: number | null;
  descripcion: string;
  activo: boolean;
  requiere_pago: boolean;
}

export interface EspacioComunInput {
  condominio_id: number;
  nombre: string;
  tipo: 'ESTACIONAMIENTO' | 'QUINCHO' | 'MULTICANCHA' | 'SALA_EVENTOS';
  capacidad: number;
  costo_por_hora?: number | null;
  descripcion?: string;
  requiere_pago: boolean;
}

class EspaciosComunesService {
  private baseUrl = '/api/v1/espacios-comunes';

  async getByCondominio(condominioId: number): Promise<EspacioComun[]> {
    const response = await fetch(`${this.baseUrl}?condominio_id=${condominioId}`);
    
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
    // Validar que condominio_id existe
    if (!data.condominio_id) {
      throw new Error('condominio_id es requerido');
    }

    console.log('Enviando datos:', JSON.stringify(data, null, 2));
    
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Error del servidor:', errorData);
      throw new Error(errorData.detail || 'Error al crear espacio común');
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
    const response = await fetch(`${this.baseUrl}?condominio_id=${condominioId}&tipo=${tipo}`);
    
    if (!response.ok) {
      throw new Error('Error al cargar espacios comunes');
    }
    
    return response.json();
  }

  async getDisponibles(condominioId: number): Promise<EspacioComun[]> {
    const response = await fetch(`${this.baseUrl}?condominio_id=${condominioId}&disponible=true`);
    
    if (!response.ok) {
      throw new Error('Error al cargar espacios disponibles');
    }
    
    return response.json();
  }
}

export const espaciosComunesService = new EspaciosComunesService();
