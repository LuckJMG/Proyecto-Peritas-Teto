export interface Movimiento {
  id: string; // ID único compuesto
  fecha: Date;
  tipo: "CARGO" | "ABONO"; // Cargo aumenta deuda, Abono disminuye
  categoria: "GASTO_BASE" | "RESERVA" | "MULTA" | "PAGO" | "OTRO";
  descripcion: string;
  monto: number;
  estado: string; // Pagado, Pendiente, Confirmada...
}
