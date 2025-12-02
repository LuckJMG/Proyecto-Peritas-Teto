const API_BASE_URL = 'http://localhost:8000/api/v1';

export type Condominio = {
  id?: number;
  nombre: string;
  direccion: string;
  total_viviendas: number;
  ingresos: number;
  activo: boolean;
  fecha_creacion: string;
}

export type CondominioCreate = {
  nombre: string;
  direccion: string;
  total_viviendas: number;
  ingresos?: number;
  activo?: boolean;
}

class CondominioService {
  
  /**
   * Obtiene todos los condominios
   */
  async getAll(): Promise<Condominio[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/condominios`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Agregar token cuando se implemente autenticación
          // 'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener condominios: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getAll:', error);
      throw error;
    }
  }

  /**
   * Obtiene un condominio por ID
   */
  async getById(id: number): Promise<Condominio> {
    try {
      const response = await fetch(`${API_BASE_URL}/condominios/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al obtener condominio: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en getById:', error);
      throw error;
    }
  }

  /**
   * Crea un nuevo condominio
   */
  async create(data: CondominioCreate): Promise<Condominio> {
    try {
      const condominioData = {
        ...data,
        ingresos: data.ingresos ?? 0,
        activo: data.activo ?? true,
      };

      const response = await fetch(`${API_BASE_URL}/condominios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(condominioData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error al crear condominio: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en create:', error);
      throw error;
    }
  }

  /**
   * Actualiza un condominio existente
   */
  async update(id: number, data: Partial<CondominioCreate>): Promise<Condominio> {
    try {
      const response = await fetch(`${API_BASE_URL}/condominios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Error al actualizar condominio: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error en update:', error);
      throw error;
    }
  }

  /**
   * Elimina (deshabilita) un condominio
   * En lugar de borrar, cambiamos activo a false
   */
  async disable(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/condominios/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ activo: false }),
      });

      if (!response.ok) {
        throw new Error(`Error al deshabilitar condominio: ${response.status}`);
      }
    } catch (error) {
      console.error('Error en disable:', error);
      throw error;
    }
  }

  /**
   * Elimina permanentemente un condominio
   */
  async delete(id: number): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/condominios/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error al eliminar condominio: ${response.status}`);
      }
    } catch (error) {
      console.error('Error en delete:', error);
      throw error;
    }
  }

  /**
   * Verifica si existe un condominio con el mismo nombre o dirección
   * excluyendo opcionalmente un ID específico (para edición)
   */
  async checkDuplicates(nombre: string, direccion: string, excludeId?: number): Promise<{
    nombreDuplicado: boolean;
    direccionDuplicada: boolean;
  }> {
    try {
      const condominios = await this.getAll();
      
      const nombreDuplicado = condominios.some(
        c => c.nombre.toLowerCase() === nombre.toLowerCase() && c.id !== excludeId
      );
      
      const direccionDuplicada = condominios.some(
        c => c.direccion.toLowerCase() === direccion.toLowerCase() && c.id !== excludeId
      );
      
      return { nombreDuplicado, direccionDuplicada };
    } catch (error) {
      console.error('Error en checkDuplicates:', error);
      throw error;
    }
  }
}

export const condominioService = new CondominioService();
