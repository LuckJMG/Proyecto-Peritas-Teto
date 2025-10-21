# coding: utf-8

from typing import Dict, List  # noqa: F401
import importlib
import pkgutil

from app.apis.usuarios_api_base import BaseUsuariosApi
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
from app.models.rol_usuario import RolUsuario
from app.models.usuario import Usuario
from app.models.usuario_input import UsuarioInput
from app.models.usuarios_get200_response import UsuariosGet200Response


router = APIRouter()

ns_pkg = app.impl
for _, name, _ in pkgutil.iter_modules(ns_pkg.__path__, ns_pkg.__name__ + "."):
    importlib.import_module(name)


@router.get(
    "/usuarios",
    responses={
        200: {"model": UsuariosGet200Response, "description": "Lista de usuarios"},
    },
    tags=["Usuarios"],
    summary="Listar usuarios",
    response_model_by_alias=True,
)
async def usuarios_get(
    condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")] = Query(None, description="ID del condominio", alias="condominioId"),
    rol: Optional[RolUsuario] = Query(None, description="", alias="rol"),
) -> UsuariosGet200Response:
    if not BaseUsuariosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseUsuariosApi.subclasses[0]().usuarios_get(condominio_id, rol)


@router.post(
    "/usuarios",
    responses={
        201: {"model": Usuario, "description": "Usuario creado"},
    },
    tags=["Usuarios"],
    summary="Crear usuario",
    response_model_by_alias=True,
)
async def usuarios_post(
    usuario_input: UsuarioInput = Body(None, description=""),
) -> Usuario:
    if not BaseUsuariosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseUsuariosApi.subclasses[0]().usuarios_post(usuario_input)


@router.patch(
    "/usuarios/{usuarioId}/deshabilitar",
    responses={
        200: {"description": "Usuario deshabilitado"},
    },
    tags=["Usuarios"],
    summary="Deshabilitar usuario",
    response_model_by_alias=True,
)
async def usuarios_usuario_id_deshabilitar_patch(
    usuarioId: Annotated[StrictInt, Field(description="ID del usuario")] = Path(..., description="ID del usuario"),
) -> None:
    if not BaseUsuariosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseUsuariosApi.subclasses[0]().usuarios_usuario_id_deshabilitar_patch(usuarioId)


@router.get(
    "/usuarios/{usuarioId}",
    responses={
        200: {"model": Usuario, "description": "Detalles del usuario"},
    },
    tags=["Usuarios"],
    summary="Obtener usuario",
    response_model_by_alias=True,
)
async def usuarios_usuario_id_get(
    usuarioId: Annotated[StrictInt, Field(description="ID del usuario")] = Path(..., description="ID del usuario"),
) -> Usuario:
    if not BaseUsuariosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseUsuariosApi.subclasses[0]().usuarios_usuario_id_get(usuarioId)


@router.put(
    "/usuarios/{usuarioId}",
    responses={
        200: {"model": Usuario, "description": "Usuario actualizado"},
    },
    tags=["Usuarios"],
    summary="Actualizar usuario",
    response_model_by_alias=True,
)
async def usuarios_usuario_id_put(
    usuarioId: Annotated[StrictInt, Field(description="ID del usuario")] = Path(..., description="ID del usuario"),
    usuario_input: UsuarioInput = Body(None, description=""),
) -> Usuario:
    if not BaseUsuariosApi.subclasses:
        raise HTTPException(status_code=500, detail="Not implemented")
    return await BaseUsuariosApi.subclasses[0]().usuarios_usuario_id_put(usuarioId, usuario_input)
