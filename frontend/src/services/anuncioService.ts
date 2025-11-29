import type { Anuncio, AnuncioInput } from "../types/anuncio.types";
import { safeStorage } from "@/lib/storage";
import { authService } from "./authService"; // Necesitamos el usuario para saber quién publica

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
    // QUITAMOS el slash al final para evitar redirect 307
    const response = await fetch(`${API_URL}/anuncios?skip=${skip}&limit=${limit}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Error al obtener anuncios");
    return response.json();
  },

  create: async (data: AnuncioInput): Promise<Anuncio> => {
    // 1. Obtener usuario actual para llenar los IDs obligatorios
    const user = authService.getUser();
    if (!user || !user.id) throw new Error("Usuario no identificado");

    // 2. Mapear datos: Frontend (descripcion) -> Backend (contenido)
    //    Backend Schema requiere: condominio_id, titulo, contenido, creado_por
    const payload = {
      titulo: data.titulo,
      contenido: data.descripcion, // El backend espera 'contenido', no 'descripcion'
      condominio_id: user.condominioId || 1, // Fallback a 1 si no tiene condominio asignado (para testing)
      creado_por: user.id,
      activo: true
    };

    // QUITAMOS el slash al final
    const response = await fetch(`${API_URL}/anuncios`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Error Backend:", errorData);
      throw new Error(errorData.detail || "Error al crear anuncio"); // El detail te dirá exactamente qué falta
    }
    return response.json();
  },

  update: async (id: number, data: AnuncioInput): Promise<Anuncio> => {
    const user = authService.getUser();
    
    // Mapeamos también para el update
    const payload = {
      titulo: data.titulo,
      contenido: data.descripcion,
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