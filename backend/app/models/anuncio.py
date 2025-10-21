from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from typing import Optional

class Anuncio(SQLModel, table=True):
    __tablename__ = "anuncios"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    condominio_id: int = Field(foreign_key="condominios.id")
    titulo: str = Field(index=True)
    contenido: str
    activo: bool = Field(default=True)
    fecha_publicacion: datetime = Field(default_factory=datetime.utcnow)
    creado_por: int = Field(foreign_key="usuarios.id")
    
    # Relationships
    condominio: "Condominio" = Relationship(back_populates="anuncios")
    creador: "Usuario" = Relationship()