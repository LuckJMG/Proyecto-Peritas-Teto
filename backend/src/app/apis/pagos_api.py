# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from app.apis.pagos_api_base import BasePagosApi
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
from pydantic import Field, StrictBytes, StrictInt, StrictStr, field_validator
from typing import Any, Optional, Tuple, Union
from typing_extensions import Annotated
from app.models.pago import Pago
from app.models.pago_input import PagoInput
from app.models.pagos_get200_response import PagosGet200Response


router = APIRouter()

ns_pkg = app.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/pagos",
    responses={
        200: {"model": PagosGet200Response, "description": "Lista de pagos"},
    },
    tags=["Pagos"],
    summary="Listar pagos",
    response_model_by_alias=True,
)
async def pagos_get(
    condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")] = Query(None, description="ID del condominio", alias="condominioId"),
    residente_id: Optional[StrictInt] = Query(None, description="", alias="residenteId"),
    tipo: Optional[StrictStr] = Query(None, description="", alias="tipo"),
) -> PagosGet200Response:
    if not BasePagosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BasePagosApi.subclasses[0]().pagos_get(condominio_id, residente_id, tipo)


@router.get(
    "/pagos/{pagoId}/comprobante",
    responses={
        200: {"model": file, "description": "Comprobante de pago"},
    },
    tags=["Pagos"],
    summary="Obtener comprobante de pago",
    response_model_by_alias=True,
)
async def pagos_pago_id_comprobante_get(
    pagoId: Annotated[StrictInt, Field(description="ID del pago")] = Path(..., description="ID del pago"),
) -> file:
    if not BasePagosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BasePagosApi.subclasses[0]().pagos_pago_id_comprobante_get(pagoId)


@router.post(
    "/pagos/{pagoId}/comprobante",
    responses={
        200: {"description": "Comprobante adjuntado"},
    },
    tags=["Pagos"],
    summary="Adjuntar comprobante de pago",
    response_model_by_alias=True,
)
async def pagos_pago_id_comprobante_post(
    pagoId: Annotated[StrictInt, Field(description="ID del pago")] = Path(..., description="ID del pago"),
    archivo: Optional[Union[StrictBytes, StrictStr, Tuple[StrictStr, StrictBytes]]] = Form(None, description=""),
) -> None:
    if not BasePagosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BasePagosApi.subclasses[0]().pagos_pago_id_comprobante_post(pagoId, archivo)


@router.get(
    "/pagos/{pagoId}",
    responses={
        200: {"model": Pago, "description": "Detalles del pago"},
    },
    tags=["Pagos"],
    summary="Obtener pago",
    response_model_by_alias=True,
)
async def pagos_pago_id_get(
    pagoId: Annotated[StrictInt, Field(description="ID del pago")] = Path(..., description="ID del pago"),
) -> Pago:
    if not BasePagosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BasePagosApi.subclasses[0]().pagos_pago_id_get(pagoId)


@router.post(
    "/pagos",
    responses={
        201: {"model": Pago, "description": "Pago registrado"},
    },
    tags=["Pagos"],
    summary="Registrar pago",
    response_model_by_alias=True,
)
async def pagos_post(
    pago_input: PagoInput = Body(None, description=""),
) -> Pago:
    if not BasePagosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BasePagosApi.subclasses[0]().pagos_post(pago_input)
