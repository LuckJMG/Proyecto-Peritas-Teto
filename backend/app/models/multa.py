from sqlmodel import SQLModel, Field, Relationship
from datetime import date, datetime
from typing import Optional, List
from enum import Enum
from decimal import Decimal

class TipoMulta(str, Enum):
    RETRASO_PAGO = "RETRASO_PAGO"
    INFRAESTRUCTURA = "INFRAESTRUCTURA"
    RUIDO = "RUIDO"
    MASCOTA = "MASCOTA"
    OTRO = "OTRO"

class EstadoMulta(str, Enum):
    PENDIENTE = "PENDIENTE"
    PAGADA = "PAGADA"
    CONDONADA = "CONDONADA"

class Multa(SQLModel, table=True):
    __tablename__ = "multas"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    residente_id: int = Field(foreign_key="residentes.id")
    condominio_id: int = Field(foreign_key="condominios.id")
    tipo: TipoMulta
    descripcion: str
    monto: Decimal = Field(max_digits=10, decimal_places=2)
    estado: EstadoMulta = Field(default=EstadoMulta.PENDIENTE)
    fecha_emision: date = Field(default_factory=date.today)
    fecha_pago: Optional[datetime] = None
    motivo_condonacion: Optional[str] = None
    creado_por: int = Field(foreign_key="usuarios.id")
    
    # Relationships
    residente: "Residente" = Relationship(back_populates="multas")
    condominio: "Condominio" = Relationship(back_populates="multas")
    creador: "Usuario" = Relationship()
    pagos: List["Pago"] = Relationship(back_populates="multa")