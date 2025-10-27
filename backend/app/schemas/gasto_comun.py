from datetime import date
from decimal import Decimal
from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from enum import Enum


class EstadoGastoComun(str, Enum):
    PENDIENTE = "PENDIENTE"
    PAGADO = "PAGADO"
    VENCIDO = "VENCIDO"
    MOROSO = "MOROSO"


class GastoComunInput(BaseModel):
    residente_id: int
    condominio_id: int
    mes: int = Field(ge=1, le=12)
    anio: int
    monto_base: Decimal
    cuota_mantencion: Decimal = 0
    servicios: Decimal
    multas: Decimal = 0
    monto_total: Decimal
    estado: Optional[EstadoGastoComun] = EstadoGastoComun.PENDIENTE
    fecha_vencimiento: date
    observaciones: List[Dict] = []
