# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictInt  # noqa: F401
from typing import Any, Optional  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from app.models.multa import Multa  # noqa: F401
from app.models.multa_input import MultaInput  # noqa: F401
from app.models.multas_get200_response import MultasGet200Response  # noqa: F401
from app.models.multas_multa_id_condonar_patch_request import MultasMultaIdCondonarPatchRequest  # noqa: F401


def test_multas_get(client: TestClient):
    """Test case for multas_get

    Listar multas
    """
    params = [("condominio_id", 56),     ("residente_id", 56)]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/multas",
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_multas_multa_id_condonar_patch(client: TestClient):
    """Test case for multas_multa_id_condonar_patch

    Condonar multa
    """
    multas_multa_id_condonar_patch_request = app.MultasMultaIdCondonarPatchRequest()

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PATCH",
    #    "/multas/{multaId}/condonar".format(multaId=56),
    #    headers=headers,
    #    json=multas_multa_id_condonar_patch_request,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_multas_multa_id_get(client: TestClient):
    """Test case for multas_multa_id_get

    Obtener multa
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/multas/{multaId}".format(multaId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_multas_multa_id_put(client: TestClient):
    """Test case for multas_multa_id_put

    Modificar multa
    """
    multa_input = {"descripcion":"descripcion","tipo":"RETRASO_PAGO","monto":0.14658129805029452,"residente_id":0,"condominio_id":6}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/multas/{multaId}".format(multaId=56),
    #    headers=headers,
    #    json=multa_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_multas_post(client: TestClient):
    """Test case for multas_post

    Crear multa
    """
    multa_input = {"descripcion":"descripcion","tipo":"RETRASO_PAGO","monto":0.14658129805029452,"residente_id":0,"condominio_id":6}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/multas",
    #    headers=headers,
    #    json=multa_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

