from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime
from enum import Enum

class TipoAlerta(str, Enum):
    MOROSIDAD = "MOROSIDAD"
    MULTA = "MULTA"
    EDICION_GASTO = "EDICION_GASTO"
    SISTEMA = "SISTEMA"

class EstadoAlerta(str, Enum):
    PENDIENTE = "PENDIENTE"
    RESUELTO = "RESUELTO"

class Alerta(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    titulo: str
    descripcion: str
    tipo: TipoAlerta
    estado: EstadoAlerta = Field(default=EstadoAlerta.PENDIENTE)
    fecha_creacion: datetime = Field(default_factory=datetime.now)
    
    # Campos para resolución
    comentario_resolucion: Optional[str] = None
    fecha_resolucion: Optional[datetime] = None
    resuelto_por: Optional[int] = None # ID del admin que resolvió
    
    condominio_id: Optional[int] = None