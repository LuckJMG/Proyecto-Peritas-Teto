from sqlmodel import SQLModel, Field, Relationship, Column, JSON
from datetime import date, datetime
from typing import Optional, List
from enum import Enum
from decimal import Decimal

class EstadoGastoComun(str, Enum):
    PENDIENTE = "PENDIENTE"
    PAGADO = "PAGADO"
    VENCIDO = "VENCIDO"
    MOROSO = "MOROSO"

class GastoComun(SQLModel, table=True):
    __tablename__ = "gastos_comunes"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    residente_id: int = Field(foreign_key="residentes.id", index=True)
    condominio_id: int = Field(foreign_key="condominios.id", index=True)
    mes: int = Field(ge=1, le=12)
    anio: int
    monto_base: Decimal = Field(max_digits=10, decimal_places=2)
    cuota_mantencion: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    servicios: Decimal = Field(max_digits=10, decimal_places=2)
    multas: Decimal = Field(default=0, max_digits=10, decimal_places=2)
    monto_total: Decimal = Field(max_digits=10, decimal_places=2)
    estado: EstadoGastoComun = Field(default=EstadoGastoComun.PENDIENTE)
    fecha_emision: date = Field(default_factory=date.today)
    fecha_vencimiento: date
    fecha_pago: Optional[datetime] = None
    observaciones: List[dict] = Field(default=[], sa_column=Column(JSON))
    
    # Relationships
    residente: "Residente" = Relationship(back_populates="gastos_comunes")
    condominio: "Condominio" = Relationship(back_populates="gastos_comunes")