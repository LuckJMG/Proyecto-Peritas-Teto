import type { Anuncio, AnuncioInput } from "../types/anuncio.types";
import { authService } from "./authService";

const API_URL = "http://localhost:8000/api/v1";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    ...(token ? { "Authorization": `Bearer ${token}` } : {})
  };
};

export const anuncioService = {
  getAll: async (skip: number = 0, limit: number = 100): Promise<Anuncio[]> => {
    try {
      const response = await fetch(`${API_URL}/anuncios?skip=${skip}&limit=${limit}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error al obtener anuncios: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error en getAll:", error);
      throw error;
    }
  },

  create: async (data: AnuncioInput): Promise<Anuncio> => {
    try {
      const user = authService.getUser();
      if (!user || !user.id) {
        throw new Error("Usuario no identificado");
      }

      const payload = {
        titulo: data.titulo,
        contenido: data.contenido,
        condominio_id: user.condominio_id || user.condominioId || 1,
        creado_por: user.id,
        activo: true
      };

      const response = await fetch(`${API_URL}/anuncios`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error al crear anuncio: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error en create:", error);
      throw error;
    }
  },

  update: async (id: number, data: AnuncioInput): Promise<Anuncio> => {
    try {
      const user = authService.getUser();
      if (!user) {
        throw new Error("Usuario no identificado");
      }
      
      const payload = {
        titulo: data.titulo,
        contenido: data.contenido,
        condominio_id: user.condominio_id || user.condominioId || 1,
        creado_por: user.id,
        activo: true
      };

      const response = await fetch(`${API_URL}/anuncios/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error al actualizar anuncio: ${response.status}`);
      }
      
      return response.json();
    } catch (error) {
      console.error("Error en update:", error);
      throw error;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_URL}/anuncios/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error al eliminar anuncio: ${response.status}`);
      }
    } catch (error) {
      console.error("Error en delete:", error);
      throw error;
    }
  }
};