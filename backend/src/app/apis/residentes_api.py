# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from app.apis.residentes_api_base import BaseResidentesApi
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
from typing import Optional
from typing_extensions import Annotated
from app.models.residente import Residente
from app.models.residente_input import ResidenteInput
from app.models.residentes_get200_response import ResidentesGet200Response


router = APIRouter()

ns_pkg = app.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/residentes",
    responses={
        200: {"model": ResidentesGet200Response, "description": "Lista de residentes"},
    },
    tags=["Residentes"],
    summary="Listar residentes",
    response_model_by_alias=True,
)
async def residentes_get(
    condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")] = Query(None, description="ID del condominio", alias="condominioId"),
) -> ResidentesGet200Response:
    if not BaseResidentesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseResidentesApi.subclasses[0]().residentes_get(condominio_id)


@router.post(
    "/residentes",
    responses={
        201: {"model": Residente, "description": "Residente registrado"},
    },
    tags=["Residentes"],
    summary="Registrar residente",
    response_model_by_alias=True,
)
async def residentes_post(
    residente_input: ResidenteInput = Body(None, description=""),
) -> Residente:
    if not BaseResidentesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseResidentesApi.subclasses[0]().residentes_post(residente_input)


@router.get(
    "/residentes/{residenteId}",
    responses={
        200: {"model": Residente, "description": "Detalles del residente"},
    },
    tags=["Residentes"],
    summary="Obtener residente",
    response_model_by_alias=True,
)
async def residentes_residente_id_get(
    residenteId: Annotated[StrictInt, Field(description="ID del residente")] = Path(..., description="ID del residente"),
) -> Residente:
    if not BaseResidentesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseResidentesApi.subclasses[0]().residentes_residente_id_get(residenteId)


@router.put(
    "/residentes/{residenteId}",
    responses={
        200: {"model": Residente, "description": "Residente actualizado"},
    },
    tags=["Residentes"],
    summary="Actualizar residente",
    response_model_by_alias=True,
)
async def residentes_residente_id_put(
    residenteId: Annotated[StrictInt, Field(description="ID del residente")] = Path(..., description="ID del residente"),
    residente_input: ResidenteInput = Body(None, description=""),
) -> Residente:
    if not BaseResidentesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseResidentesApi.subclasses[0]().residentes_residente_id_put(residenteId, residente_input)
