# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from app.apis.gastos_comunes_api_base import BaseGastosComunesApi
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
from pydantic import Field, StrictInt, StrictStr, field_validator
from typing import Any, Optional
from typing_extensions import Annotated
from app.models.gasto_comun import GastoComun
from app.models.gasto_comun_input import GastoComunInput
from app.models.gastos_comunes_gasto_comun_id_observaciones_post_request import GastosComunesGastoComunIdObservacionesPostRequest
from app.models.gastos_comunes_get200_response import GastosComunesGet200Response


router = APIRouter()

ns_pkg = app.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/gastos-comunes/{gastoComunId}",
    responses={
        200: {"model": GastoComun, "description": "Detalles del gasto común"},
    },
    tags=["Gastos Comunes"],
    summary="Obtener gasto común",
    response_model_by_alias=True,
)
async def gastos_comunes_gasto_comun_id_get(
    gastoComunId: Annotated[StrictInt, Field(description="ID del gasto común")] = Path(..., description="ID del gasto común"),
) -> GastoComun:
    if not BaseGastosComunesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseGastosComunesApi.subclasses[0]().gastos_comunes_gasto_comun_id_get(gastoComunId)


@router.post(
    "/gastos-comunes/{gastoComunId}/notificar",
    responses={
        200: {"description": "Notificación enviada"},
    },
    tags=["Gastos Comunes"],
    summary="Enviar notificación de gasto común por correo",
    response_model_by_alias=True,
)
async def gastos_comunes_gasto_comun_id_notificar_post(
    gastoComunId: Annotated[StrictInt, Field(description="ID del gasto común")] = Path(..., description="ID del gasto común"),
) -> None:
    if not BaseGastosComunesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseGastosComunesApi.subclasses[0]().gastos_comunes_gasto_comun_id_notificar_post(gastoComunId)


@router.post(
    "/gastos-comunes/{gastoComunId}/observaciones",
    responses={
        201: {"description": "Observación agregada"},
    },
    tags=["Gastos Comunes"],
    summary="Agregar observación al gasto común",
    response_model_by_alias=True,
)
async def gastos_comunes_gasto_comun_id_observaciones_post(
    gastoComunId: Annotated[StrictInt, Field(description="ID del gasto común")] = Path(..., description="ID del gasto común"),
    gastos_comunes_gasto_comun_id_observaciones_post_request: GastosComunesGastoComunIdObservacionesPostRequest = Body(None, description=""),
) -> None:
    if not BaseGastosComunesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseGastosComunesApi.subclasses[0]().gastos_comunes_gasto_comun_id_observaciones_post(gastoComunId, gastos_comunes_gasto_comun_id_observaciones_post_request)


@router.put(
    "/gastos-comunes/{gastoComunId}",
    responses={
        200: {"model": GastoComun, "description": "Gasto común actualizado"},
    },
    tags=["Gastos Comunes"],
    summary="Actualizar gasto común",
    response_model_by_alias=True,
)
async def gastos_comunes_gasto_comun_id_put(
    gastoComunId: Annotated[StrictInt, Field(description="ID del gasto común")] = Path(..., description="ID del gasto común"),
    gasto_comun_input: GastoComunInput = Body(None, description=""),
) -> GastoComun:
    if not BaseGastosComunesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseGastosComunesApi.subclasses[0]().gastos_comunes_gasto_comun_id_put(gastoComunId, gasto_comun_input)


@router.get(
    "/gastos-comunes",
    responses={
        200: {"model": GastosComunesGet200Response, "description": "Lista de gastos comunes"},
    },
    tags=["Gastos Comunes"],
    summary="Listar gastos comunes",
    response_model_by_alias=True,
)
async def gastos_comunes_get(
    condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")] = Query(None, description="ID del condominio", alias="condominioId"),
    residente_id: Optional[StrictInt] = Query(None, description="", alias="residenteId"),
    mes: Optional[Annotated[int, Field(le=12, strict=True, ge=1)]] = Query(None, description="", alias="mes", ge=1, le=12),
    anio: Optional[StrictInt] = Query(None, description="", alias="anio"),
    estado: Optional[StrictStr] = Query(None, description="", alias="estado"),
) -> GastosComunesGet200Response:
    if not BaseGastosComunesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseGastosComunesApi.subclasses[0]().gastos_comunes_get(condominio_id, residente_id, mes, anio, estado)


@router.post(
    "/gastos-comunes",
    responses={
        201: {"model": GastoComun, "description": "Gasto común creado"},
    },
    tags=["Gastos Comunes"],
    summary="Crear gasto común",
    response_model_by_alias=True,
)
async def gastos_comunes_post(
    gasto_comun_input: GastoComunInput = Body(None, description=""),
) -> GastoComun:
    if not BaseGastosComunesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseGastosComunesApi.subclasses[0]().gastos_comunes_post(gasto_comun_input)
