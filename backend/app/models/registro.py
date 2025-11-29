# backend/app/models/registro.py
from datetime import datetime
from typing import Optional
from sqlmodel import Field, SQLModel, Relationship
from enum import Enum


class TipoEvento(str, Enum):
    RESERVA = "RESERVA"
    ANUNCIO = "ANUNCIO"
    MULTA = "MULTA"
    PAGO = "PAGO"
    EDICION = "EDICION"
    ELIMINACION = "ELIMINACION"
    CREACION = "CREACION"
    OTRO = "OTRO"


# Modelo de base de datos
class RegistroModel(SQLModel, table=True):
    __tablename__ = "registros"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    
    # Usuario que realizó la acción
    usuario_id: int = Field(foreign_key="usuarios.id")
    
    # Tipo de evento
    tipo_evento: TipoEvento
    
    # Descripción/detalle del evento
    detalle: str
    
    # Monto asociado (opcional)
    monto: Optional[float] = Field(default=None)
    
    # Condominio relacionado (opcional)
    condominio_id: Optional[int] = Field(default=None, foreign_key="condominios.id")
    
    # Metadata adicional (JSON string para flexibilidad)
    datos_adicionales: Optional[str] = Field(default=None)
    
    # Timestamps
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    
    # Relaciones
    # usuario: Optional["Usuario"] = Relationship(back_populates="registros")


# Modelo Pydantic para API responses
class Registro(SQLModel):
    id: int
    usuario_id: int
    tipo_evento: TipoEvento
    detalle: str
    monto: Optional[float] = None
    condominio_id: Optional[int] = None
    datos_adicionales: Optional[str] = None
    fecha_creacion: datetime
    
    # Datos desnormalizados para mostrar
    usuario_nombre: Optional[str] = None
    usuario_apellido: Optional[str] = None


# Modelo para crear registros
class RegistroCreate(SQLModel):
    usuario_id: int
    tipo_evento: TipoEvento
    detalle: str
    monto: Optional[float] = None
    condominio_id: Optional[int] = None
    datos_adicionales: Optional[str] = None