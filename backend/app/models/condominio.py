from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional, List

class Condominio(SQLModel, table=True):
    __tablename__ = "condominios"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(index=True)
    direccion: str
    total_viviendas: int
    activo: bool = Field(default=True)
    fecha_creacion: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    usuarios: List["Usuario"] = Relationship(back_populates="condominio")
    residentes: List["Residente"] = Relationship(back_populates="condominio")
    gastos_comunes: List["GastoComun"] = Relationship(back_populates="condominio")
    multas: List["Multa"] = Relationship(back_populates="condominio")
    espacios_comunes: List["EspacioComun"] = Relationship(back_populates="condominio")
    anuncios: List["Anuncio"] = Relationship(back_populates="condominio")