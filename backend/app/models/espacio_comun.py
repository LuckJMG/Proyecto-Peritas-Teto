from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from enum import Enum
from decimal import Decimal

class TipoEspacioComun(str, Enum):
    ESTACIONAMIENTO = "ESTACIONAMIENTO"
    QUINCHO = "QUINCHO"
    MULTICANCHA = "MULTICANCHA"
    SALA_EVENTOS = "SALA_EVENTOS"

class EspacioComun(SQLModel, table=True):
    __tablename__ = "espacios_comunes"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    condominio_id: int = Field(foreign_key="condominios.id")
    nombre: str = Field(index=True)
    tipo: TipoEspacioComun
    capacidad: Optional[int] = None
    costo_por_hora: Optional[Decimal] = Field(default=None, max_digits=10, decimal_places=2)
    descripcion: Optional[str] = None
    activo: bool = Field(default=True)
    requiere_pago: bool = Field(default=False)
    
    # Relationships
    condominio: "Condominio" = Relationship(back_populates="espacios_comunes")
    reservas: List["Reserva"] = Relationship(back_populates="espacio_comun")