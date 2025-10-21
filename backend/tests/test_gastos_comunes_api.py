# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictInt, StrictStr, field_validator  # noqa: F401
from typing import Any, Optional  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from app.models.gasto_comun import GastoComun  # noqa: F401
from app.models.gasto_comun_input import GastoComunInput  # noqa: F401
from app.models.gastos_comunes_gasto_comun_id_observaciones_post_request import GastosComunesGastoComunIdObservacionesPostRequest  # noqa: F401
from app.models.gastos_comunes_get200_response import GastosComunesGet200Response  # noqa: F401


def test_gastos_comunes_gasto_comun_id_get(client: TestClient):
    """Test case for gastos_comunes_gasto_comun_id_get

    Obtener gasto común
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/gastos-comunes/{gastoComunId}".format(gastoComunId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_gastos_comunes_gasto_comun_id_notificar_post(client: TestClient):
    """Test case for gastos_comunes_gasto_comun_id_notificar_post

    Enviar notificación de gasto común por correo
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/gastos-comunes/{gastoComunId}/notificar".format(gastoComunId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_gastos_comunes_gasto_comun_id_observaciones_post(client: TestClient):
    """Test case for gastos_comunes_gasto_comun_id_observaciones_post

    Agregar observación al gasto común
    """
    gastos_comunes_gasto_comun_id_observaciones_post_request = app.GastosComunesGastoComunIdObservacionesPostRequest()

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/gastos-comunes/{gastoComunId}/observaciones".format(gastoComunId=56),
    #    headers=headers,
    #    json=gastos_comunes_gasto_comun_id_observaciones_post_request,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_gastos_comunes_gasto_comun_id_put(client: TestClient):
    """Test case for gastos_comunes_gasto_comun_id_put

    Actualizar gasto común
    """
    gasto_comun_input = {"servicios":0.23021358869347652,"fecha_vencimiento":"2000-01-23","residente_id":0,"monto_base":0.5637376656633328,"condominio_id":6,"mes":2,"año":5}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "PUT",
    #    "/gastos-comunes/{gastoComunId}".format(gastoComunId=56),
    #    headers=headers,
    #    json=gasto_comun_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_gastos_comunes_get(client: TestClient):
    """Test case for gastos_comunes_get

    Listar gastos comunes
    """
    params = [("condominio_id", 56),     ("residente_id", 56),     ("mes", 56),     ("anio", 56),     ("estado", 'estado_example')]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/gastos-comunes",
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_gastos_comunes_post(client: TestClient):
    """Test case for gastos_comunes_post

    Crear gasto común
    """
    gasto_comun_input = {"servicios":0.23021358869347652,"fecha_vencimiento":"2000-01-23","residente_id":0,"monto_base":0.5637376656633328,"condominio_id":6,"mes":2,"año":5}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/gastos-comunes",
    #    headers=headers,
    #    json=gasto_comun_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

