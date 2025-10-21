from sqlmodel import SQLModel, Field, Relationship
from datetime import date, datetime, time
from typing import Optional
from enum import Enum
from decimal import Decimal

class EstadoReserva(str, Enum):
    PENDIENTE_PAGO = "PENDIENTE_PAGO"
    CONFIRMADA = "CONFIRMADA"
    CANCELADA = "CANCELADA"
    COMPLETADA = "COMPLETADA"

class Reserva(SQLModel, table=True):
    __tablename__ = "reservas"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    espacio_comun_id: int = Field(foreign_key="espacios_comunes.id")
    residente_id: int = Field(foreign_key="residentes.id")
    fecha_reserva: date
    hora_inicio: time
    hora_fin: time
    estado: EstadoReserva = Field(default=EstadoReserva.PENDIENTE_PAGO)
    monto_pago: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2)
    pago_id: Optional[int] = Field(default=None, foreign_key="pagos.id")
    observaciones: Optional[str] = None
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    espacio_comun: "EspacioComun" = Relationship(back_populates="reservas")
    residente: "Residente" = Relationship(back_populates="reservas")
    pago: Optional["Pago"] = Relationship(back_populates="reservas")