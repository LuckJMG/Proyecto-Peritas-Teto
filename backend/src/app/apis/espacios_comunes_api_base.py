# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from datetime import date
from pydantic import Field, StrictBool, StrictInt, StrictStr, field_validator
from typing import Any, List, Optional
from typing_extensions import Annotated
from app.models.espacio_comun import EspacioComun
from app.models.espacio_comun_input import EspacioComunInput
from app.models.reserva import Reserva
from app.models.reservas_get200_response import ReservasGet200Response
from app.models.reservas_input import ReservasInput


class BaseEspaciosComunesApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseEspaciosComunesApi.subclasses = BaseEspaciosComunesApi.subclasses + (cls,)
    async def espacios_comunes_espacio_comun_id_get(
        self,
        espacioComunId: Annotated[StrictInt, Field(description="ID del espacio común")],
    ) -> EspacioComun:
        ...


    async def espacios_comunes_get(
        self,
        condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")],
        tipo: Optional[StrictStr],
        disponible: Optional[StrictBool],
    ) -> List[EspacioComun]:
        ...


    async def espacios_comunes_post(
        self,
        espacio_comun_input: EspacioComunInput,
    ) -> EspacioComun:
        ...


    async def reservas_get(
        self,
        condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")],
        espacio_comun_id: Optional[StrictInt],
        residente_id: Optional[StrictInt],
        fecha_desde: Optional[date],
        fecha_hasta: Optional[date],
    ) -> ReservasGet200Response:
        ...


    async def reservas_post(
        self,
        reservas_input: ReservasInput,
    ) -> Reserva:
        ...


    async def reservas_reserva_id_delete(
        self,
        reservaId: Annotated[StrictInt, Field(description="ID de la reserva")],
    ) -> None:
        ...


    async def reservas_reserva_id_get(
        self,
        reservaId: Annotated[StrictInt, Field(description="ID de la reserva")],
    ) -> Reserva:
        ...
