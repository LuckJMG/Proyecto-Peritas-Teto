from typing import Optional
from sqlmodel import SQLModel
from app.models.usuario import RolUsuario
from datetime import datetime

class UsuarioBase(SQLModel):
    email: str
    nombre: str
    apellido: str
    rol: RolUsuario = RolUsuario.RESIDENTE
    condominio_id: Optional[int] = None
    activo: bool = True

class UsuarioRead(UsuarioBase):
    id: int
    fecha_creacion: datetime
    ultimo_acceso: Optional[datetime] = None
    total_deuda: float = 0.0
    
    # Nuevos campos para mostrar en la tabla
    telefono: Optional[str] = None
    vivienda: Optional[str] = None

    class Config:
        orm_mode = True

class UsuarioCreate(UsuarioBase):
    password: str
    
    # Campos opcionales para creación simultánea de Residente
    rut: Optional[str] = None
    telefono: Optional[str] = None
    vivienda_numero: Optional[str] = None
    es_propietario: bool = False

class UsuarioUpdate(SQLModel):
    email: Optional[str] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    password: Optional[str] = None
    rol: Optional[RolUsuario] = None
    condominio_id: Optional[int] = None
    activo: Optional[bool] = None
    
    # Nuevos campos para actualizar residente
    rut: Optional[str] = None
    telefono: Optional[str] = None
    vivienda_numero: Optional[str] = None
    es_propietario: Optional[bool] = None