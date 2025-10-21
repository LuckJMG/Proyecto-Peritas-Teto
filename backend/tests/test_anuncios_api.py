# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictBool, StrictInt  # noqa: F401
from typing import Any, Optional  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from app.models.anuncio import Anuncio  # noqa: F401
from app.models.anuncio_input import AnuncioInput  # noqa: F401
from app.models.anuncios_get200_response import AnunciosGet200Response  # noqa: F401


def test_anuncios_anuncio_id_delete(client: TestClient):
    """Test case for anuncios_anuncio_id_delete

    Eliminar anuncio
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "DELETE",
    #    "/anuncios/{anuncioId}".format(anuncioId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_anuncios_anuncio_id_get(client: TestClient):
    """Test case for anuncios_anuncio_id_get

    Obtener anuncio
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/anuncios/{anuncioId}".format(anuncioId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_anuncios_anuncio_id_put(client: TestClient):
    """Test case for anuncios_anuncio_id_put

    Actualizar anuncio
    """
    anuncio_input = {"contenido":"contenido","titulo":"titulo","condominio_id":0}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/anuncios/{anuncioId}".format(anuncioId=56),
    #    headers=headers,
    #    json=anuncio_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_anuncios_get(client: TestClient):
    """Test case for anuncios_get

    Listar anuncios
    """
    params = [("condominio_id", 56),     ("activo", True)]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/anuncios",
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_anuncios_post(client: TestClient):
    """Test case for anuncios_post

    Crear anuncio
    """
    anuncio_input = {"contenido":"contenido","titulo":"titulo","condominio_id":0}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/anuncios",
    #    headers=headers,
    #    json=anuncio_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

