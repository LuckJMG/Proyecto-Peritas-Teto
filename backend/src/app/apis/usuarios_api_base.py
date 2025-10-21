# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from pydantic import Field, StrictInt
from typing import Any, Optional
from typing_extensions import Annotated
from app.models.rol_usuario import RolUsuario
from app.models.usuario import Usuario
from app.models.usuario_input import UsuarioInput
from app.models.usuarios_get200_response import UsuariosGet200Response


class BaseUsuariosApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseUsuariosApi.subclasses = BaseUsuariosApi.subclasses + (cls,)
    async def usuarios_get(
        self,
        condominio_id: Annotated[Optional[StrictInt], Field(description="ID del condominio")],
        rol: Optional[RolUsuario],
    ) -> UsuariosGet200Response:
        ...


    async def usuarios_post(
        self,
        usuario_input: UsuarioInput,
    ) -> Usuario:
        ...


    async def usuarios_usuario_id_deshabilitar_patch(
        self,
        usuarioId: Annotated[StrictInt, Field(description="ID del usuario")],
    ) -> None:
        ...


    async def usuarios_usuario_id_get(
        self,
        usuarioId: Annotated[StrictInt, Field(description="ID del usuario")],
    ) -> Usuario:
        ...


    async def usuarios_usuario_id_put(
        self,
        usuarioId: Annotated[StrictInt, Field(description="ID del usuario")],
        usuario_input: UsuarioInput,
    ) -> Usuario:
        ...
