from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class AnuncioInput(BaseModel):
    condominio_id: int
    titulo: str
    contenido: str
    activo: Optional[bool] = True
    creado_por: int  # ID del usuario que publica
