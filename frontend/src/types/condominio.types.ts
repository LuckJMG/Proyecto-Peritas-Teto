import type { Condominio } from "@/services/condominioService";

export interface SortConfig {
  key: keyof Condominio | null;
  direction: 'asc' | 'desc';
}

export interface ValidationErrors {
  nombre?: string;
  direccion?: string;
}

export interface CondominioFormData {
  nombre: string;
  direccion: string;
  total_viviendas: number;
  ingresos: number;
}

export type { Condominio };
