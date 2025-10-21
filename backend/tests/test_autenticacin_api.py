# coding: utf-8

from fastapi.testclient import TestClient


from typing import Any  # noqa: F401
from app.models.auth_login_post_request import AuthLoginPostRequest  # noqa: F401
from app.models.auth_response import AuthResponse  # noqa: F401
from app.models.error import Error  # noqa: F401


def test_auth_login_post(client: TestClient):
    """Test case for auth_login_post

    Iniciar sesión
    """
    auth_login_post_request = app.AuthLoginPostRequest()

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/auth/login",
    #    headers=headers,
    #    json=auth_login_post_request,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200


def test_auth_logout_post(client: TestClient):
    """Test case for auth_logout_post

    Cerrar sesión
    """

    headers = {
    }
    # uncomment below to make a request
    #response = client.request(
    #    "POST",
    #    "/auth/logout",
    #    headers=headers,
    #)

    # uncomment below to assert the status code of the HTTP response
    #assert response.status_code == 200

