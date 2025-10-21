# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field, StrictInt
from typing import Any
from typing_extensions import Annotated
from app.models.condominio import Condominio
from app.models.condominio_input import CondominioInput
from app.models.condominios_get200_response import CondominiosGet200Response
from app.models.error import Error


class BaseCondominiosApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseCondominiosApi.subclasses = BaseCondominiosApi.subclasses + (cls,)
    async def condominios_condominio_id_delete(
        self,
        condominioId: Annotated[StrictInt, Field(description="ID del condominio")],
    ) -> None:
        ...


    async def condominios_condominio_id_get(
        self,
        condominioId: Annotated[StrictInt, Field(description="ID del condominio")],
    ) -> Condominio:
        ...


    async def condominios_condominio_id_put(
        self,
        condominioId: Annotated[StrictInt, Field(description="ID del condominio")],
        condominio_input: CondominioInput,
    ) -> Condominio:
        ...


    async def condominios_get(
        self,
    ) -> CondominiosGet200Response:
        ...


    async def condominios_post(
        self,
        condominio_input: CondominioInput,
    ) -> Condominio:
        ...
