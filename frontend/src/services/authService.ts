// frontend/src/services/authService.ts
const API_URL = 'http://localhost:8000/api/v1';

import type { RegisterCredentials } from '@/types/auth.types';

export const RolUsuario = {
  SUPER_ADMINISTRADOR: 'SUPER_ADMINISTRADOR',
  ADMINISTRADOR: 'ADMINISTRADOR',
  CONSERJE: 'CONSERJE',
  DIRECTIVA: 'DIRECTIVA',
  RESIDENTE: 'RESIDENTE'
} as const;

export type RolUsuario = typeof RolUsuario[keyof typeof RolUsuario];

// CORRECCIÓN: Ajustado a snake_case para coincidir con backend Pydantic model
interface LoginResponse {
  access_token: string;
  refresh_token: string;
  usuario: {
    id: number;
    email: string;
    nombre: string;
    apellido: string;
    rol: RolUsuario;
    condominioId?: number;
    activo: boolean;
  };
}

export interface CrearUsuarioDTO {
  email: string;
  nombre: string;
  apellido: string;
  rol: RolUsuario;
  activo: boolean;
  condominio_id?: number;
  password_hash: string;
}

export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Error al iniciar sesión');
    }

    const data: LoginResponse = await response.json();
    
    // Guardar tokens (Mapeando desde las propiedades correctas)
    if (data.access_token) {
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('refreshToken', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.usuario));
    }
    
    return data;
  },

  logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getToken() {
    return localStorage.getItem('accessToken');
  },

  getUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  getRouteByRole(rol: RolUsuario): string {
    const routes: Record<RolUsuario, string> = {
      [RolUsuario.SUPER_ADMINISTRADOR]: '/condominios',
      [RolUsuario.ADMINISTRADOR]: '/dashboard',
      [RolUsuario.CONSERJE]: '/dashboard',
      [RolUsuario.DIRECTIVA]: '/dashboard',
      [RolUsuario.RESIDENTE]: '/estado'
    };
    
    return routes[rol] || '/estado';
  },

   async registerAndLogin(data: RegisterCredentials) {
    const res = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: data.email,
        nombre: data.nombre,
        apellido: data.apellido,
        rol: 'RESIDENTE',
        activo: true,
        condominio_id: null,
        password_hash: data.password
      })
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(error.detail || 'Error al registrarse');
    }

    const loginData = await this.login(data.email, data.password);
    return loginData;
  }
};

// Hook para usar en componentes protegidos
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = authService.getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Solo inyectar Bearer si existe el token
  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401) {
    // Si el token es inválido o expiró, cerrar sesión
    console.warn("Sesión expirada o token inválido (401). Redirigiendo a login.");
    authService.logout();
    window.location.href = '/login';
  }

  return response;
};
