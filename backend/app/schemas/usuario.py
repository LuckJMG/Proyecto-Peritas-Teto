from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.usuario import RolUsuario


class UsuarioBase(BaseModel):
    email: EmailStr
    nombre: str
    apellido: str
    rol: RolUsuario
    activo: bool = True


class UsuarioCreate(UsuarioBase):
    password_hash: str  # o password si luego la encriptas


class UsuarioUpdate(BaseModel):
    email: Optional[EmailStr] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    rol: Optional[RolUsuario] = None
    activo: Optional[bool] = None


class UsuarioRead(UsuarioBase):
    id: int
    fecha_creacion: datetime
    ultimo_acceso: Optional[datetime]

    class Config:
        from_attributes = True
