// src/services/usuarioService.ts

const API_BASE_URL = "http://localhost:8000/api/v1";

export type RolUsuario =
  | "ADMINISTRADOR"
  | "CONSERJE"
  | "DIRECTIVA"
  | "RESIDENTE";

export interface Usuario {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  activo: boolean;
  fecha_creacion: string;
  ultimo_acceso?: string;
  estado_cuenta?: "DEUDA" | "AL_DIA";
  fecha_ultimo_pago?: string;
  condominio_id?: number;
  total_deuda?: number; // Campo agregado
}

export interface UsuarioCreate {
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  password_hash: string; // Nota: en backend corregimos a "password" en input, asegúrate de enviar el campo correcto
  condominio_id?: number;
  activo?: boolean;
}

export type UsuarioUpdate = Partial<{
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  activo: boolean;
  password_hash: string;
  condominio_id: number;
}>;

class UsuarioService {
  async getAll(): Promise<Usuario[]> {
    const res = await fetch(`${API_BASE_URL}/usuarios`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Error al obtener usuarios: ${res.status}`);
    }
    return res.json();
  }

  async create(data: UsuarioCreate): Promise<Usuario> {
    // Mapeo simple si tu backend espera "password" pero tu interfaz dice "password_hash"
    const payload = {
        ...data,
        password: data.password_hash // Ajuste de compatibilidad
    };
    
    const res = await fetch(`${API_BASE_URL}/usuarios`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Error al crear usuario: ${res.status}`,
      );
    }
    return res.json();
  }

  async update(id: number, data: UsuarioUpdate): Promise<Usuario> {
    const res = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.detail || `Error al actualizar usuario: ${res.status}`,
      );
    }
    return res.json();
  }

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) {
      throw new Error(`Error al eliminar usuario: ${res.status}`);
    }
  }
}

export const usuarioService = new UsuarioService();
