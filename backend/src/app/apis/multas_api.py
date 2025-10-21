# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from app.apis.multas_api_base import BaseMultasApi
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
from typing import Any, Optional
from typing_extensions import Annotated
from app.models.multa import Multa
from app.models.multa_input import MultaInput
from app.models.multas_get200_response import MultasGet200Response
from app.models.multas_multa_id_condonar_patch_request import MultasMultaIdCondonarPatchRequest


router = APIRouter()

ns_pkg = app.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/multas",
    responses={
        200: {"model": MultasGet200Response, "description": "Lista de multas"},
    },
    tags=["Multas"],
    summary="Listar multas",
    response_model_by_alias=True,
)
async def multas_get(
    condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")] = Query(None, description="ID del condominio", alias="condominioId"),
    residente_id: Optional[StrictInt] = Query(None, description="", alias="residenteId"),
) -> MultasGet200Response:
    if not BaseMultasApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseMultasApi.subclasses[0]().multas_get(condominio_id, residente_id)


@router.patch(
    "/multas/{multaId}/condonar",
    responses={
        200: {"description": "Multa condonada"},
    },
    tags=["Multas"],
    summary="Condonar multa",
    response_model_by_alias=True,
)
async def multas_multa_id_condonar_patch(
    multaId: Annotated[StrictInt, Field(description="ID de la multa")] = Path(..., description="ID de la multa"),
    multas_multa_id_condonar_patch_request: Optional[MultasMultaIdCondonarPatchRequest] = Body(None, description=""),
) -> None:
    if not BaseMultasApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseMultasApi.subclasses[0]().multas_multa_id_condonar_patch(multaId, multas_multa_id_condonar_patch_request)


@router.get(
    "/multas/{multaId}",
    responses={
        200: {"model": Multa, "description": "Detalles de la multa"},
    },
    tags=["Multas"],
    summary="Obtener multa",
    response_model_by_alias=True,
)
async def multas_multa_id_get(
    multaId: Annotated[StrictInt, Field(description="ID de la multa")] = Path(..., description="ID de la multa"),
) -> Multa:
    if not BaseMultasApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseMultasApi.subclasses[0]().multas_multa_id_get(multaId)


@router.put(
    "/multas/{multaId}",
    responses={
        200: {"model": Multa, "description": "Multa actualizada"},
    },
    tags=["Multas"],
    summary="Modificar multa",
    response_model_by_alias=True,
)
async def multas_multa_id_put(
    multaId: Annotated[StrictInt, Field(description="ID de la multa")] = Path(..., description="ID de la multa"),
    multa_input: MultaInput = Body(None, description=""),
) -> Multa:
    if not BaseMultasApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseMultasApi.subclasses[0]().multas_multa_id_put(multaId, multa_input)


@router.post(
    "/multas",
    responses={
        201: {"model": Multa, "description": "Multa creada"},
    },
    tags=["Multas"],
    summary="Crear multa",
    response_model_by_alias=True,
)
async def multas_post(
    multa_input: MultaInput = Body(None, description=""),
) -> Multa:
    if not BaseMultasApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseMultasApi.subclasses[0]().multas_post(multa_input)
