from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ReservaCreate(BaseModel):
    residente_id: int
    espacio_comun_id: int
    fecha_inicio: datetime
    fecha_fin: datetime
    cantidad_personas: int
    observaciones: Optional[str] = None
