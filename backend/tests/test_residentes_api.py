# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictInt  # noqa: F401
from typing import Optional  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from app.models.residente import Residente  # noqa: F401
from app.models.residente_input import ResidenteInput  # noqa: F401
from app.models.residentes_get200_response import ResidentesGet200Response  # noqa: F401


def test_residentes_get(client: TestClient):
    """Test case for residentes_get

    Listar residentes
    """
    params = [("condominio_id", 56)]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/residentes",
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_residentes_post(client: TestClient):
    """Test case for residentes_post

    Registrar residente
    """
    residente_input = {"rut":"rut","vivienda_numero":"viviendaNumero","fecha_ingreso":"2000-01-23","apellido":"apellido","condominio_id":6,"telefono":"telefono","usuario_id":0,"nombre":"nombre","es_propietario":1,"email":"email"}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/residentes",
    #    headers=headers,
    #    json=residente_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_residentes_residente_id_get(client: TestClient):
    """Test case for residentes_residente_id_get

    Obtener residente
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/residentes/{residenteId}".format(residenteId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_residentes_residente_id_put(client: TestClient):
    """Test case for residentes_residente_id_put

    Actualizar residente
    """
    residente_input = {"rut":"rut","vivienda_numero":"viviendaNumero","fecha_ingreso":"2000-01-23","apellido":"apellido","condominio_id":6,"telefono":"telefono","usuario_id":0,"nombre":"nombre","es_propietario":1,"email":"email"}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/residentes/{residenteId}".format(residenteId=56),
    #    headers=headers,
    #    json=residente_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

