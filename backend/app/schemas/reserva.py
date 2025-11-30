from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReservaCreate(BaseModel):
    residente_id: Optional[int] = None  # Opcional para admins
    espacio_comun_id: int
    fecha_inicio: datetime
    fecha_fin: datetime
    cantidad_personas: int
    observaciones: Optional[str] = None
    es_evento_comunidad: bool = False
