export interface Movimiento {
  id: string;
  fecha: Date;
  tipo: "CARGO" | "ABONO";
  categoria: "GASTO_BASE" | "RESERVA" | "MULTA" | "PAGO" | "OTRO";
  descripcion: string;
  monto: number;
  estado: string;
}
