# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field, StrictInt
from typing import Any, Optional
from typing_extensions import Annotated
from app.models.multa import Multa
from app.models.multa_input import MultaInput
from app.models.multas_get200_response import MultasGet200Response
from app.models.multas_multa_id_condonar_patch_request import MultasMultaIdCondonarPatchRequest


class BaseMultasApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseMultasApi.subclasses = BaseMultasApi.subclasses + (cls,)
    async def multas_get(
        self,
        condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")],
        residente_id: Optional[StrictInt],
    ) -> MultasGet200Response:
        ...


    async def multas_multa_id_condonar_patch(
        self,
        multaId: Annotated[StrictInt, Field(description="ID de la multa")],
        multas_multa_id_condonar_patch_request: Optional[MultasMultaIdCondonarPatchRequest],
    ) -> None:
        ...


    async def multas_multa_id_get(
        self,
        multaId: Annotated[StrictInt, Field(description="ID de la multa")],
    ) -> Multa:
        ...


    async def multas_multa_id_put(
        self,
        multaId: Annotated[StrictInt, Field(description="ID de la multa")],
        multa_input: MultaInput,
    ) -> Multa:
        ...


    async def multas_post(
        self,
        multa_input: MultaInput,
    ) -> Multa:
        ...
