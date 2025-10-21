# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from app.apis.anuncios_api_base import BaseAnunciosApi
import app.impl

from fastapi import (  # noqa: F401
    APIRouter,
    Body,
    Cookie,
    Depends,
    Form,
    Header,
    HTTPException,
    Path,
    Query,
    Response,
    Security,
    status,
)

from app.models.extra_models import TokenModel  # noqa: F401
from pydantic import Field, StrictBool, StrictInt
from typing import Any, Optional
from typing_extensions import Annotated
from app.models.anuncio import Anuncio
from app.models.anuncio_input import AnuncioInput
from app.models.anuncios_get200_response import AnunciosGet200Response


router = APIRouter()

ns_pkg = app.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.delete(
    "/anuncios/{anuncioId}",
    responses={
        204: {"description": "Anuncio eliminado"},
    },
    tags=["Anuncios"],
    summary="Eliminar anuncio",
    response_model_by_alias=True,
)
async def anuncios_anuncio_id_delete(
    anuncioId: Annotated[StrictInt, Field(description="ID del anuncio")] = Path(..., description="ID del anuncio"),
) -> None:
    if not BaseAnunciosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAnunciosApi.subclasses[0]().anuncios_anuncio_id_delete(anuncioId)


@router.get(
    "/anuncios/{anuncioId}",
    responses={
        200: {"model": Anuncio, "description": "Detalles del anuncio"},
    },
    tags=["Anuncios"],
    summary="Obtener anuncio",
    response_model_by_alias=True,
)
async def anuncios_anuncio_id_get(
    anuncioId: Annotated[StrictInt, Field(description="ID del anuncio")] = Path(..., description="ID del anuncio"),
) -> Anuncio:
    if not BaseAnunciosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAnunciosApi.subclasses[0]().anuncios_anuncio_id_get(anuncioId)


@router.put(
    "/anuncios/{anuncioId}",
    responses={
        200: {"description": "Anuncio actualizado"},
    },
    tags=["Anuncios"],
    summary="Actualizar anuncio",
    response_model_by_alias=True,
)
async def anuncios_anuncio_id_put(
    anuncioId: Annotated[StrictInt, Field(description="ID del anuncio")] = Path(..., description="ID del anuncio"),
    anuncio_input: AnuncioInput = Body(None, description=""),
) -> None:
    if not BaseAnunciosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAnunciosApi.subclasses[0]().anuncios_anuncio_id_put(anuncioId, anuncio_input)


@router.get(
    "/anuncios",
    responses={
        200: {"model": AnunciosGet200Response, "description": "Lista de anuncios"},
    },
    tags=["Anuncios"],
    summary="Listar anuncios",
    response_model_by_alias=True,
)
async def anuncios_get(
    condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")] = Query(None, description="ID del condominio", alias="condominioId"),
    activo: Optional[StrictBool] = Query(None, description="", alias="activo"),
) -> AnunciosGet200Response:
    if not BaseAnunciosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAnunciosApi.subclasses[0]().anuncios_get(condominio_id, activo)


@router.post(
    "/anuncios",
    responses={
        201: {"model": Anuncio, "description": "Anuncio creado"},
    },
    tags=["Anuncios"],
    summary="Crear anuncio",
    response_model_by_alias=True,
)
async def anuncios_post(
    anuncio_input: AnuncioInput = Body(None, description=""),
) -> Anuncio:
    if not BaseAnunciosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAnunciosApi.subclasses[0]().anuncios_post(anuncio_input)
