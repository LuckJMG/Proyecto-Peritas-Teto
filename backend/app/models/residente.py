from sqlmodel import SQLModel, Field, Relationship
from datetime import date, datetime
from typing import Optional, List

class Residente(SQLModel, table=True):
    __tablename__ = "residentes"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuarios.id")
    condominio_id: int = Field(foreign_key="condominios.id")
    vivienda_numero: str = Field(index=True)
    nombre: str
    apellido: str
    rut: str = Field(unique=True, index=True)
    telefono: Optional[str] = None
    email: str = Field(index=True)
    suscrito_notificaciones: bool = Field(default=True)
    ultimo_correo_enviado: Optional[datetime] = None
    es_propietario: bool
    fecha_ingreso: date = Field(default_factory=date.today)
    activo: bool = Field(default=True)
    
    # Relationships
    usuario: Optional["Usuario"] = Relationship(back_populates="residentes")
    condominio: "Condominio" = Relationship(back_populates="residentes")
    gastos_comunes: List["GastoComun"] = Relationship(back_populates="residente")
    multas: List["Multa"] = Relationship(back_populates="residente")
    reservas: List["Reserva"] = Relationship(back_populates="residente")
    pagos: List["Pago"] = Relationship(back_populates="residente") 
