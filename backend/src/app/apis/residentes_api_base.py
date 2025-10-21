# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field, StrictInt
from typing import Optional
from typing_extensions import Annotated
from app.models.residente import Residente
from app.models.residente_input import ResidenteInput
from app.models.residentes_get200_response import ResidentesGet200Response


class BaseResidentesApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseResidentesApi.subclasses = BaseResidentesApi.subclasses + (cls,)
    async def residentes_get(
        self,
        condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")],
    ) -> ResidentesGet200Response:
        ...


    async def residentes_post(
        self,
        residente_input: ResidenteInput,
    ) -> Residente:
        ...


    async def residentes_residente_id_get(
        self,
        residenteId: Annotated[StrictInt, Field(description="ID del residente")],
    ) -> Residente:
        ...


    async def residentes_residente_id_put(
        self,
        residenteId: Annotated[StrictInt, Field(description="ID del residente")],
        residente_input: ResidenteInput,
    ) -> Residente:
        ...
