import type { Anuncio, AnuncioInput } from "../types/anuncio.types";
import { safeStorage } from "@/lib/storage";
import { authService } from "./authService";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const getAuthHeaders = () => {
  const token = safeStorage.getItem("accessToken");
  return {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  };
};

export const anuncioService = {
  getAll: async (skip: number = 0, limit: number = 100): Promise<Anuncio[]> => {
    const response = await fetch(`${API_URL}/anuncios?skip=${skip}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener anuncios");
    return response.json();
  },

  create: async (data: AnuncioInput): Promise<Anuncio> => {
    const user = authService.getUser();
    if (!user || !user.id) throw new Error("Usuario no identificado");

    const payload = {
      titulo: data.titulo,
      contenido: data.contenido, // CORREGIDO: usar 'contenido'
      condominio_id: user.condominioId || 1,
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
      throw new Error(errorData.detail || "Error al crear anuncio");
    }
    return response.json();
  },

  update: async (id: number, data: AnuncioInput): Promise<Anuncio> => {
    const user = authService.getUser();
    
    const payload = {
      titulo: data.titulo,
      contenido: data.contenido, // CORREGIDO: usar 'contenido'
      condominio_id: user?.condominioId || 1,
      creado_por: user?.id,
      activo: true
    };

    const response = await fetch(`${API_URL}/anuncios/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "Error al actualizar anuncio");
    }
    return response.json();
  },

  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_URL}/anuncios/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al eliminar anuncio");
  }
};