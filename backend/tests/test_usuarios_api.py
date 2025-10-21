# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictInt  # noqa: F401
from typing import Any, Optional  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from app.models.rol_usuario import RolUsuario  # noqa: F401
from app.models.usuario import Usuario  # noqa: F401
from app.models.usuario_input import UsuarioInput  # noqa: F401
from app.models.usuarios_get200_response import UsuariosGet200Response  # noqa: F401


def test_usuarios_get(client: TestClient):
    """Test case for usuarios_get

    Listar usuarios
    """
    params = [("condominio_id", 56),     ("rol", app.RolUsuario())]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/usuarios",
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_usuarios_post(client: TestClient):
    """Test case for usuarios_post

    Crear usuario
    """
    usuario_input = {"password":"password","apellido":"apellido","condominio_id":0,"nombre":"nombre","email":"email","rol":"SUPER_ADMINISTRADOR"}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/usuarios",
    #    headers=headers,
    #    json=usuario_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_usuarios_usuario_id_deshabilitar_patch(client: TestClient):
    """Test case for usuarios_usuario_id_deshabilitar_patch

    Deshabilitar usuario
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PATCH",
    #    "/usuarios/{usuarioId}/deshabilitar".format(usuarioId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_usuarios_usuario_id_get(client: TestClient):
    """Test case for usuarios_usuario_id_get

    Obtener usuario
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/usuarios/{usuarioId}".format(usuarioId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_usuarios_usuario_id_put(client: TestClient):
    """Test case for usuarios_usuario_id_put

    Actualizar usuario
    """
    usuario_input = {"password":"password","apellido":"apellido","condominio_id":0,"nombre":"nombre","email":"email","rol":"SUPER_ADMINISTRADOR"}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/usuarios/{usuarioId}".format(usuarioId=56),
    #    headers=headers,
    #    json=usuario_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

