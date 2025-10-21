# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from app.apis.espacios_comunes_api_base import BaseEspaciosComunesApi
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
from datetime import date
from pydantic import Field, StrictBool, StrictInt, StrictStr, field_validator
from typing import Any, List, Optional
from typing_extensions import Annotated
from app.models.espacio_comun import EspacioComun
from app.models.espacio_comun_input import EspacioComunInput
from app.models.reserva import Reserva
from app.models.reservas_get200_response import ReservasGet200Response
from app.models.reservas_input import ReservasInput


router = APIRouter()

ns_pkg = app.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/espacios-comunes/{espacioComunId}",
    responses={
        200: {"model": EspacioComun, "description": "Detalles del espacio común"},
    },
    tags=["Espacios Comunes"],
    summary="Obtener espacio común",
    response_model_by_alias=True,
)
async def espacios_comunes_espacio_comun_id_get(
    espacioComunId: Annotated[StrictInt, Field(description="ID del espacio común")] = Path(..., description="ID del espacio común"),
) -> EspacioComun:
    if not BaseEspaciosComunesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseEspaciosComunesApi.subclasses[0]().espacios_comunes_espacio_comun_id_get(espacioComunId)


@router.get(
    "/espacios-comunes",
    responses={
        200: {"model": List[EspacioComun], "description": "Lista de espacios comunes"},
    },
    tags=["Espacios Comunes"],
    summary="Listar espacios comunes",
    response_model_by_alias=True,
)
async def espacios_comunes_get(
    condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")] = Query(None, description="ID del condominio", alias="condominioId"),
    tipo: Optional[StrictStr] = Query(None, description="", alias="tipo"),
    disponible: Optional[StrictBool] = Query(None, description="", alias="disponible"),
) -> List[EspacioComun]:
    if not BaseEspaciosComunesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseEspaciosComunesApi.subclasses[0]().espacios_comunes_get(condominio_id, tipo, disponible)


@router.post(
    "/espacios-comunes",
    responses={
        201: {"model": EspacioComun, "description": "Espacio común creado"},
    },
    tags=["Espacios Comunes"],
    summary="Crear espacio común",
    response_model_by_alias=True,
)
async def espacios_comunes_post(
    espacio_comun_input: EspacioComunInput = Body(None, description=""),
) -> EspacioComun:
    if not BaseEspaciosComunesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseEspaciosComunesApi.subclasses[0]().espacios_comunes_post(espacio_comun_input)


@router.get(
    "/reservas",
    responses={
        200: {"model": ReservasGet200Response, "description": "Lista de reservas"},
    },
    tags=["Espacios Comunes"],
    summary="Listar reservas",
    response_model_by_alias=True,
)
async def reservas_get(
    condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")] = Query(None, description="ID del condominio", alias="condominioId"),
    espacio_comun_id: Optional[StrictInt] = Query(None, description="", alias="espacioComunId"),
    residente_id: Optional[StrictInt] = Query(None, description="", alias="residenteId"),
    fecha_desde: Optional[date] = Query(None, description="", alias="fechaDesde"),
    fecha_hasta: Optional[date] = Query(None, description="", alias="fechaHasta"),
) -> ReservasGet200Response:
    if not BaseEspaciosComunesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseEspaciosComunesApi.subclasses[0]().reservas_get(condominio_id, espacio_comun_id, residente_id, fecha_desde, fecha_hasta)


@router.post(
    "/reservas",
    responses={
        201: {"model": Reserva, "description": "Reserva creada"},
        409: {"description": "Espacio no disponible"},
    },
    tags=["Espacios Comunes"],
    summary="Crear reserva",
    response_model_by_alias=True,
)
async def reservas_post(
    reservas_input: ReservasInput = Body(None, description=""),
) -> Reserva:
    if not BaseEspaciosComunesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseEspaciosComunesApi.subclasses[0]().reservas_post(reservas_input)


@router.delete(
    "/reservas/{reservaId}",
    responses={
        204: {"description": "Reserva cancelada"},
    },
    tags=["Espacios Comunes"],
    summary="Cancelar reserva",
    response_model_by_alias=True,
)
async def reservas_reserva_id_delete(
    reservaId: Annotated[StrictInt, Field(description="ID de la reserva")] = Path(..., description="ID de la reserva"),
) -> None:
    if not BaseEspaciosComunesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseEspaciosComunesApi.subclasses[0]().reservas_reserva_id_delete(reservaId)


@router.get(
    "/reservas/{reservaId}",
    responses={
        200: {"model": Reserva, "description": "Detalles de la reserva"},
    },
    tags=["Espacios Comunes"],
    summary="Obtener reserva",
    response_model_by_alias=True,
)
async def reservas_reserva_id_get(
    reservaId: Annotated[StrictInt, Field(description="ID de la reserva")] = Path(..., description="ID de la reserva"),
) -> Reserva:
    if not BaseEspaciosComunesApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseEspaciosComunesApi.subclasses[0]().reservas_reserva_id_get(reservaId)
