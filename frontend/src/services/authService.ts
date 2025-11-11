// frontend/src/services/authService.ts
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
    
    // Guardar tokens
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.usuario));
    
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

  // Obtener la ruta según el rol del usuario
  getRouteByRole(rol: RolUsuario): string {
    const routes: Record<RolUsuario, string> = {
      [RolUsuario.SUPER_ADMINISTRADOR]: '/condominios',
      [RolUsuario.ADMINISTRADOR]: '/dashboard',
      [RolUsuario.CONSERJE]: '/dashboard',
      [RolUsuario.DIRECTIVA]: '/dashboard',
      [RolUsuario.RESIDENTE]: '/estado'
    };
    
    return routes[rol] || '/estado';
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