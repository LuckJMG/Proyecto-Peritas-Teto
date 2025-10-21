# coding: utf-8

from fastapi.testclient import TestClient


from datetime import date  # noqa: F401
from pydantic import Field, StrictBool, StrictInt, StrictStr, field_validator  # noqa: F401
from typing import Any, List, Optional  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from app.models.espacio_comun import EspacioComun  # noqa: F401
from app.models.espacio_comun_input import EspacioComunInput  # noqa: F401
from app.models.reserva import Reserva  # noqa: F401
from app.models.reservas_get200_response import ReservasGet200Response  # noqa: F401
from app.models.reservas_input import ReservasInput  # noqa: F401


def test_espacios_comunes_espacio_comun_id_get(client: TestClient):
    """Test case for espacios_comunes_espacio_comun_id_get

    Obtener espacio común
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/espacios-comunes/{espacioComunId}".format(espacioComunId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_espacios_comunes_get(client: TestClient):
    """Test case for espacios_comunes_get

    Listar espacios comunes
    """
    params = [("condominio_id", 56),     ("tipo", 'tipo_example'),     ("disponible", True)]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/espacios-comunes",
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_espacios_comunes_post(client: TestClient):
    """Test case for espacios_comunes_post

    Crear espacio común
    """
    espacio_comun_input = {"descripcion":"descripcion","tipo":"ESTACIONAMIENTO","costo_por_hora":0.14658129805029452,"requiere_pago":1,"condominio_id":0,"nombre":"nombre","capacidad":1}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/espacios-comunes",
    #    headers=headers,
    #    json=espacio_comun_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_reservas_get(client: TestClient):
    """Test case for reservas_get

    Listar reservas
    """
    params = [("condominio_id", 56),     ("espacio_comun_id", 56),     ("residente_id", 56),     ("fecha_desde", '2013-10-20'),     ("fecha_hasta", '2013-10-20')]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/reservas",
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_reservas_post(client: TestClient):
    """Test case for reservas_post

    Crear reserva
    """
    reservas_input = {"hora_fin":"horaFin","espacio_comun_id":0,"residente_id":6,"observaciones":"observaciones","hora_inicio":"horaInicio","fecha_reserva":"2000-01-23"}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/reservas",
    #    headers=headers,
    #    json=reservas_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_reservas_reserva_id_delete(client: TestClient):
    """Test case for reservas_reserva_id_delete

    Cancelar reserva
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "DELETE",
    #    "/reservas/{reservaId}".format(reservaId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_reservas_reserva_id_get(client: TestClient):
    """Test case for reservas_reserva_id_get

    Obtener reserva
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/reservas/{reservaId}".format(reservaId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

