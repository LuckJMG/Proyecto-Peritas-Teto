# coding: utf-8

from fastapi.testclient import TestClient


from pydantic import Field, StrictBytes, StrictInt, StrictStr, field_validator  # noqa: F401
from typing import Any, Optional, Tuple, Union  # noqa: F401
from typing_extensions import Annotated  # noqa: F401
from app.models.pago import Pago  # noqa: F401
from app.models.pago_input import PagoInput  # noqa: F401
from app.models.pagos_get200_response import PagosGet200Response  # noqa: F401


def test_pagos_get(client: TestClient):
    """Test case for pagos_get

    Listar pagos
    """
    params = [("condominio_id", 56),     ("residente_id", 56),     ("tipo", 'tipo_example')]
    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/pagos",
    #    headers=headers,
    #    params=params,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_pagos_pago_id_comprobante_get(client: TestClient):
    """Test case for pagos_pago_id_comprobante_get

    Obtener comprobante de pago
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/pagos/{pagoId}/comprobante".format(pagoId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_pagos_pago_id_comprobante_post(client: TestClient):
    """Test case for pagos_pago_id_comprobante_post

    Adjuntar comprobante de pago
    """

    headers = {
    }
    data = {
        "archivo": '/path/to/file'
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/pagos/{pagoId}/comprobante".format(pagoId=56),
    #    headers=headers,
    #    data=data,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_pagos_pago_id_get(client: TestClient):
    """Test case for pagos_pago_id_get

    Obtener pago
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "GET",
    #    "/pagos/{pagoId}".format(pagoId=56),
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_pagos_post(client: TestClient):
    """Test case for pagos_post

    Registrar pago
    """
    pago_input = {"referencia_id":1,"metodo_pago":"TRANSFERENCIA","tipo":"GASTO_COMUN","monto":0.5962133916683182,"numero_transaccion":"numeroTransaccion","residente_id":6,"condominio_id":0}

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/pagos",
    #    headers=headers,
    #    json=pago_input,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

