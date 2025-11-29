export interface Anuncio {
  id: number;
  titulo: string;
  descripcion: string;
  fecha_creacion: string;
  autor_id: number;
  // Agregar autor_nombre si el backend lo devuelve, 
  // o manejarlo con un placeholder por ahora.
}

export interface AnuncioInput {
  titulo: string;
  descripcion: string;
}