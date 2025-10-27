from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List
from enum import Enum

class RolUsuario(str, Enum):
    SUPER_ADMINISTRADOR = "SUPER_ADMINISTRADOR"
    ADMINISTRADOR = "ADMINISTRADOR"
    CONSERJE = "CONSERJE"
    DIRECTIVA = "DIRECTIVA"
    RESIDENTE = "RESIDENTE"

class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    nombre: str
    apellido: str
    password_hash: str
    rol: RolUsuario
    condominio_id: Optional[int] = Field(default=None, foreign_key="condominios.id")
    activo: bool = Field(default=True)
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    ultimo_acceso: Optional[datetime] = None
    
    # Relationships
    condominio: Optional["Condominio"] = Relationship(back_populates="usuarios")
    residentes: List["Residente"] = Relationship(back_populates="usuario")