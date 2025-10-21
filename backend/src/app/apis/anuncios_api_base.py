# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field, StrictBool, StrictInt
from typing import Any, Optional
from typing_extensions import Annotated
from app.models.anuncio import Anuncio
from app.models.anuncio_input import AnuncioInput
from app.models.anuncios_get200_response import AnunciosGet200Response


class BaseAnunciosApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseAnunciosApi.subclasses = BaseAnunciosApi.subclasses + (cls,)
    async def anuncios_anuncio_id_delete(
        self,
        anuncioId: Annotated[StrictInt, Field(description="ID del anuncio")],
    ) -> None:
        ...


    async def anuncios_anuncio_id_get(
        self,
        anuncioId: Annotated[StrictInt, Field(description="ID del anuncio")],
    ) -> Anuncio:
        ...


    async def anuncios_anuncio_id_put(
        self,
        anuncioId: Annotated[StrictInt, Field(description="ID del anuncio")],
        anuncio_input: AnuncioInput,
    ) -> None:
        ...


    async def anuncios_get(
        self,
        condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")],
        activo: Optional[StrictBool],
    ) -> AnunciosGet200Response:
        ...


    async def anuncios_post(
        self,
        anuncio_input: AnuncioInput,
    ) -> Anuncio:
        ...
