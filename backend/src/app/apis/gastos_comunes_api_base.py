# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field, StrictInt, StrictStr, field_validator
from typing import Any, Optional
from typing_extensions import Annotated
from app.models.gasto_comun import GastoComun
from app.models.gasto_comun_input import GastoComunInput
from app.models.gastos_comunes_gasto_comun_id_observaciones_post_request import GastosComunesGastoComunIdObservacionesPostRequest
from app.models.gastos_comunes_get200_response import GastosComunesGet200Response


class BaseGastosComunesApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseGastosComunesApi.subclasses = BaseGastosComunesApi.subclasses + (cls,)
    async def gastos_comunes_gasto_comun_id_get(
        self,
        gastoComunId: Annotated[StrictInt, Field(description="ID del gasto común")],
    ) -> GastoComun:
        ...


    async def gastos_comunes_gasto_comun_id_notificar_post(
        self,
        gastoComunId: Annotated[StrictInt, Field(description="ID del gasto común")],
    ) -> None:
        ...


    async def gastos_comunes_gasto_comun_id_observaciones_post(
        self,
        gastoComunId: Annotated[StrictInt, Field(description="ID del gasto común")],
        gastos_comunes_gasto_comun_id_observaciones_post_request: GastosComunesGastoComunIdObservacionesPostRequest,
    ) -> None:
        ...


    async def gastos_comunes_gasto_comun_id_put(
        self,
        gastoComunId: Annotated[StrictInt, Field(description="ID del gasto común")],
        gasto_comun_input: GastoComunInput,
    ) -> GastoComun:
        ...


    async def gastos_comunes_get(
        self,
        condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")],
        residente_id: Optional[StrictInt],
        mes: Optional[Annotated[int, Field(le=12, strict=True, ge=1)]],
        anio: Optional[StrictInt],
        estado: Optional[StrictStr],
    ) -> GastosComunesGet200Response:
        ...


    async def gastos_comunes_post(
        self,
        gasto_comun_input: GastoComunInput,
    ) -> GastoComun:
        ...
