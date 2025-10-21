# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from app.apis.autenticacin_api_base import BaseAutenticacinApi
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
from typing import Any
from app.models.auth_login_post_request import AuthLoginPostRequest
from app.models.auth_response import AuthResponse
from app.models.error import Error


router = APIRouter()

ns_pkg = app.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.post(
    "/auth/login",
    responses={
        200: {"model": AuthResponse, "description": "Login exitoso"},
        401: {"model": Error, "description": "No autorizado"},
    },
    tags=["Autenticación"],
    summary="Iniciar sesión",
    response_model_by_alias=True,
)
async def auth_login_post(
    auth_login_post_request: AuthLoginPostRequest = Body(None, description=""),
) -> AuthResponse:
    if not BaseAutenticacinApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAutenticacinApi.subclasses[0]().auth_login_post(auth_login_post_request)


@router.post(
    "/auth/logout",
    responses={
        204: {"description": "Sesión cerrada exitosamente"},
    },
    tags=["Autenticación"],
    summary="Cerrar sesión",
    response_model_by_alias=True,
)
async def auth_logout_post(
) -> None:
    if not BaseAutenticacinApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseAutenticacinApi.subclasses[0]().auth_logout_post()
