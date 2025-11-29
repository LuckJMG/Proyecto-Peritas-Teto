from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from app.models.usuario import RolUsuario

class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: str
    apellido: str
    rol: RolUsuario
    condominio_id: Optional[int] = None
    activo: bool = True

class UsuarioCreate(UsuarioBase):
    password: str 

class UsuarioUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    password: Optional[str] = None
    rol: Optional[RolUsuario] = None
    condominio_id: Optional[int] = None
    activo: Optional[bool] = None

class UsuarioRead(UsuarioBase):
    id: int
    fecha_creacion: datetime
    ultimo_acceso: Optional[datetime] = None
    total_deuda: float = 0.0  # Nuevo campo calculado

    class Config:
        from_attributes = True
