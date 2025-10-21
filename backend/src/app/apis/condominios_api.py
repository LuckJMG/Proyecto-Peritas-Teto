# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from app.apis.condominios_api_base import BaseCondominiosApi
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
from pydantic import Field, StrictInt
from typing import Any
from typing_extensions import Annotated
from app.models.condominio import Condominio
from app.models.condominio_input import CondominioInput
from app.models.condominios_get200_response import CondominiosGet200Response
from app.models.error import Error


router = APIRouter()

ns_pkg = app.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.delete(
    "/condominios/{condominioId}",
    responses={
        204: {"description": "Condominio eliminado"},
    },
    tags=["Condominios"],
    summary="Eliminar condominio",
    response_model_by_alias=True,
)
async def condominios_condominio_id_delete(
    condominioId: Annotated[StrictInt, Field(description="ID del condominio")] = Path(..., description="ID del condominio"),
) -> None:
    if not BaseCondominiosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseCondominiosApi.subclasses[0]().condominios_condominio_id_delete(condominioId)


@router.get(
    "/condominios/{condominioId}",
    responses={
        200: {"model": Condominio, "description": "Detalles del condominio"},
        404: {"model": Error, "description": "Recurso no encontrado"},
    },
    tags=["Condominios"],
    summary="Obtener detalles de condominio",
    response_model_by_alias=True,
)
async def condominios_condominio_id_get(
    condominioId: Annotated[StrictInt, Field(description="ID del condominio")] = Path(..., description="ID del condominio"),
) -> Condominio:
    if not BaseCondominiosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseCondominiosApi.subclasses[0]().condominios_condominio_id_get(condominioId)


@router.put(
    "/condominios/{condominioId}",
    responses={
        200: {"model": Condominio, "description": "Condominio actualizado"},
    },
    tags=["Condominios"],
    summary="Actualizar condominio",
    response_model_by_alias=True,
)
async def condominios_condominio_id_put(
    condominioId: Annotated[StrictInt, Field(description="ID del condominio")] = Path(..., description="ID del condominio"),
    condominio_input: CondominioInput = Body(None, description=""),
) -> Condominio:
    if not BaseCondominiosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseCondominiosApi.subclasses[0]().condominios_condominio_id_put(condominioId, condominio_input)


@router.get(
    "/condominios",
    responses={
        200: {"model": CondominiosGet200Response, "description": "Lista de condominios"},
    },
    tags=["Condominios"],
    summary="Listar condominios",
    response_model_by_alias=True,
)
async def condominios_get(
) -> CondominiosGet200Response:
    if not BaseCondominiosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseCondominiosApi.subclasses[0]().condominios_get()


@router.post(
    "/condominios",
    responses={
        201: {"model": Condominio, "description": "Condominio creado"},
        403: {"model": Error, "description": "Acceso denegado"},
    },
    tags=["Condominios"],
    summary="Crear condominio (Solo Súper Administrador)",
    response_model_by_alias=True,
)
async def condominios_post(
    condominio_input: CondominioInput = Body(None, description=""),
) -> Condominio:
    if not BaseCondominiosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseCondominiosApi.subclasses[0]().condominios_post(condominio_input)
