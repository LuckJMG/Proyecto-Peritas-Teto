// frontend/src/services/authService.ts
import { safeStorage } from '@/lib/storage'; // <--- IMPORTANTE: Importamos la utilidad
import type { RegisterCredentials } from '@/types/auth.types';

const API_URL = 'http://localhost:8000/api/v1';

// Usar const object en lugar de enum
export const RolUsuario = {
  SUPER_ADMINISTRADOR: 'SUPER_ADMINISTRADOR',
  ADMINISTRADOR: 'ADMINISTRADOR',
  CONSERJE: 'CONSERJE',
  DIRECTIVA: 'DIRECTIVA',
  RESIDENTE: 'RESIDENTE'
} as const;

export type RolUsuario = typeof RolUsuario[keyof typeof RolUsuario];

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
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
    
    safeStorage.setItem('accessToken', data.accessToken);
    safeStorage.setItem('refreshToken', data.refreshToken);
    safeStorage.setItem('user', JSON.stringify(data.usuario));
    
    return data;
  },

  logout() {
    safeStorage.removeItem('accessToken');
    safeStorage.removeItem('refreshToken');
    safeStorage.removeItem('user');
  },

  getToken() {
    return safeStorage.getItem('accessToken');
  },

  getUser() {
    const user = safeStorage.getItem('user');
    try {
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
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
  
  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (response.status === 401) {
    authService.logout();
    window.location.href = '/login';
  }

  return response;
};