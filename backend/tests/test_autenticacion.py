import pytest 
from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.usuario import Usuario, RolUsuario
from app.core.security import get_password_hash 

# Variables globales
API_PREFIX = "/api/v1" 
TEST_USER_EMAIL = "auth_user@test.com"
# CORRECCIÓN: Contraseña corta para evitar error de 72 bytes
TEST_USER_PASSWORD = "pass_auth_123" 

@pytest.fixture(scope="module", autouse=True)
def setup_login_user(db_session: Session):
    """
    (Fixture) Crea un usuario específico para las pruebas de login.
    'autouse=True' asegura que se ejecute al inicio de este módulo.
    Esto corrige el 'ValueError: password cannot be longer than 72 bytes'
    """
    user = db_session.query(Usuario).filter(Usuario.email == TEST_USER_EMAIL).first()
    if not user:
        # CORRECCIÓN: Hashear la contraseña corta
        hashed_password = get_password_hash(TEST_USER_PASSWORD)
        
        user = Usuario(
            nombre="Auth",
            apellido="TestUser",
            email=TEST_USER_EMAIL,
            password_hash=hashed_password,
            rol=RolUsuario.RESIDENTE, 
            condominio_id=1, # Asume ID=1 de conftest
            activo=True
        )
        db_session.add(user)
        db_session.commit()


def test_login_success(client: TestClient):
    """
    Prueba un inicio de sesión exitoso.
    """
    login_data = {
        "email": TEST_USER_EMAIL,
        "password": TEST_USER_PASSWORD
    }
    response = client.post(f"{API_PREFIX}/auth/login", json=login_data)
    
    assert response.status_code == 200, f"Error: {response.json()}"
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["usuario"]["email"] == TEST_USER_EMAIL

def test_login_wrong_password(client: TestClient):
    """
    Prueba un inicio de sesión con contraseña incorrecta.
    """
    login_data = {
        "email": TEST_USER_EMAIL,
        "password": "wrong_password"
    }
    response = client.post(f"{API_PREFIX}/auth/login", json=login_data)
    assert response.status_code == 401
    assert "Credenciales incorrectas" in response.json()["detail"]

def test_login_user_not_found(client: TestClient):
    """
    Prueba un inicio de sesión con un email que no existe.
    """
    login_data = {
        "email": "not_found@test.com",
        "password": "password"
    }
    response = client.post(f"{API_PREFIX}/auth/login", json=login_data)
    assert response.status_code == 401
