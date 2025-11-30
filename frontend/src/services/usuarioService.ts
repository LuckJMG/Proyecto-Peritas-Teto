// src/services/usuarioService.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

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
  total_deuda?: number;
}

export interface UsuarioCreate {
  nombre: string;
  apellido: string;
  email: string;
  rol: RolUsuario;
  password_hash: string;
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
  private getHeaders() {
     const token = localStorage.getItem("accessToken");
     return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
     };
  }

  async getAll(): Promise<Usuario[]> {
    const res = await fetch(`${API_BASE_URL}/usuarios`, {
      method: "GET",
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Error al obtener usuarios: ${res.status}`);
    }
    return res.json();
  }

  async create(data: UsuarioCreate): Promise<Usuario> {
    const payload = {
        ...data,
        password: data.password_hash 
    };
    
    const res = await fetch(`${API_BASE_URL}/usuarios`, {
      method: "POST",
      headers: this.getHeaders(),
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
      headers: this.getHeaders(),
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
      headers: this.getHeaders(),
    });
    if (!res.ok) {
      throw new Error(`Error al eliminar usuario: ${res.status}`);
    }
  }
}

export const usuarioService = new UsuarioService();