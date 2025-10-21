# coding: utf-8

from typing import ClassVar, Dict, List, Tuple  # noqa: F401

from typing import Any
from app.models.auth_login_post_request import AuthLoginPostRequest
from app.models.auth_response import AuthResponse
from app.models.error import Error


class BaseAutenticacinApi:
    subclasses: ClassVar[Tuple] = ()

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        BaseAutenticacinApi.subclasses = BaseAutenticacinApi.subclasses + (cls,)
    async def auth_login_post(
        self,
        auth_login_post_request: AuthLoginPostRequest,
    ) -> AuthResponse:
        ...


    async def auth_logout_post(
        self,
    ) -> None:
        ...
