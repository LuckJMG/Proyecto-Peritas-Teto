# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field, StrictBytes, StrictInt, StrictStr, field_validator
from typing import Any, Optional, Tuple, Union
from typing_extensions import Annotated
from app.models.pago import Pago
from app.models.pago_input import PagoInput
from app.models.pagos_get200_response import PagosGet200Response


class BasePagosApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BasePagosApi.subclasses = BasePagosApi.subclasses + (cls,)
    async def pagos_get(
        self,
        condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")],
        residente_id: Optional[StrictInt],
        tipo: Optional[StrictStr],
    ) -> PagosGet200Response:
        ...


    async def pagos_pago_id_comprobante_get(
        self,
        pagoId: Annotated[StrictInt, Field(description="ID del pago")],
    ) -> file:
        ...


    async def pagos_pago_id_comprobante_post(
        self,
        pagoId: Annotated[StrictInt, Field(description="ID del pago")],
        archivo: Optional[Union[StrictBytes, StrictStr, Tuple[StrictStr, StrictBytes]]],
    ) -> None:
        ...


    async def pagos_pago_id_get(
        self,
        pagoId: Annotated[StrictInt, Field(description="ID del pago")],
    ) -> Pago:
        ...


    async def pagos_post(
        self,
        pago_input: PagoInput,
    ) -> Pago:
        ...
