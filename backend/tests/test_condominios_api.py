# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictInt  # noqa: F401
from typing import Any  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from app.models.condominio import Condominio  # noqa: F401
from app.models.condominio_input import CondominioInput  # noqa: F401
from app.models.condominios_get200_response import CondominiosGet200Response  # noqa: F401
from app.models.error import Error  # noqa: F401


def test_condominios_condominio_id_delete(client: TestClient):
    """Test case for condominios_condominio_id_delete

    Eliminar condominio
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "DELETE",
    #    "/condominios/{condominioId}".format(condominioId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_condominios_condominio_id_get(client: TestClient):
    """Test case for condominios_condominio_id_get

    Obtener detalles de condominio
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/condominios/{condominioId}".format(condominioId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_condominios_condominio_id_put(client: TestClient):
    """Test case for condominios_condominio_id_put

    Actualizar condominio
    """
    condominio_input = {"direccion":"direccion","total_viviendas":1,"nombre":"nombre"}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/condominios/{condominioId}".format(condominioId=56),
    #    headers=headers,
    #    json=condominio_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_condominios_get(client: TestClient):
    """Test case for condominios_get

    Listar condominios
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/condominios",
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_condominios_post(client: TestClient):
    """Test case for condominios_post

    Crear condominio (Solo Súper Administrador)
    """
    condominio_input = {"direccion":"direccion","total_viviendas":1,"nombre":"nombre"}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/condominios",
    #    headers=headers,
    #    json=condominio_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

