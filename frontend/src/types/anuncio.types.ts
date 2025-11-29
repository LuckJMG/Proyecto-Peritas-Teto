export interface Anuncio {
  id: number;
  titulo: string;
  contenido: string;          
  fecha_publicacion: string; 
  creado_por: number;
  condominio_id: number;
  activo: boolean;
}

export interface AnuncioInput {
  titulo: string;
  contenido: string;
}