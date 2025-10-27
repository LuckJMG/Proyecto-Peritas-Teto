from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional
from enum import Enum
from decimal import Decimal

class TipoPago(str, Enum):
    GASTO_COMUN = "GASTO_COMUN"
    MULTA = "MULTA"
    RESERVA = "RESERVA"

class MetodoPago(str, Enum):
    TRANSFERENCIA = "TRANSFERENCIA"
    TARJETA = "TARJETA"
    EFECTIVO = "EFECTIVO"
    WEBPAY = "WEBPAY"
    KHIPU = "KHIPU"

class EstadoPago(str, Enum):
    PENDIENTE = "PENDIENTE"
    APROBADO = "APROBADO"
    RECHAZADO = "RECHAZADO"
    REVERSADO = "REVERSADO"

class Pago(SQLModel, table=True):
    __tablename__ = "pagos"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    condominio_id: int = Field(foreign_key="condominios.id", index=True)
    residente_id: int = Field(foreign_key="residentes.id", index=True)
    tipo: TipoPago
    referencia_id: int  # ID genérico (gasto_comun_id, multa_id o reserva_id)
    monto: Decimal = Field(max_digits=10, decimal_places=2)
    metodo_pago: MetodoPago
    estado_pago: EstadoPago = Field(default=EstadoPago.PENDIENTE)
    numero_transaccion: Optional[str] = None
    fecha_pago: datetime = Field(default_factory=datetime.utcnow)
    comprobante_url: Optional[str] = None
    registrado_por: int = Field(foreign_key="usuarios.id")
    
    # Relationships
    condominio: "Condominio" = Relationship()
    residente: "Residente" = Relationship(back_populates="pagos")
    registrador: "Usuario" = Relationship()