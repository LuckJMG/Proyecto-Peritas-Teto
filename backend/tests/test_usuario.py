from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.usuario import Usuario, RolUsuario
# Importamos los Schemas Pydantic que usa el endpoint
from app.schemas.usuario import UsuarioCreate, UsuarioUpdate
from datetime import datetime

# Variables globales
test_usuario_id = 0
API_PREFIX = "/api/v1" # Prefijo global de la API

def test_crear_usuario(client: TestClient):
    """
    Prueba la creación de un nuevo usuario (tipo 'residente').
    """
    global test_usuario_id
    
    test_data = {
        "nombre": "Homero",
        "apellido": "Simpson",
        "email": "homero@test.com",
        "password": "super_safe_password_123", # Password de prueba
        "rol": RolUsuario.RESIDENTE.value,
        "condominio_id": 1, # ID=1 de conftest.py
        "activo": True
    }
    
    # CORRECCIÓN: Usamos .dict() (Pydantic v1) para coincidir con tu endpoint
    data_input = UsuarioCreate(**test_data)
    json_payload = data_input.dict()

    response = client.post(f"{API_PREFIX}/usuarios", json=json_payload)
    
    assert response.status_code == 201, f"Error: {response.json()}"
    data = response.json() 
    assert data["email"] == test_data["email"]
    assert data["nombre"] == test_data["nombre"]
    assert data["rol"] == test_data["rol"]
    assert data["id"] is not None
    assert "password_hash" not in data
    test_usuario_id = data["id"]

def test_obtener_usuario_creado(client: TestClient):
    """
    Prueba obtener el usuario recién creado.
    """
    assert test_usuario_id > 0, "test_crear_usuario debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/usuarios/{test_usuario_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_usuario_id
    assert data["email"] == "homero@test.com"

def test_obtener_usuario_base(client: TestClient):
    """
    Prueba obtener el usuario base (ID=1) creado en conftest.py.
    """
    response = client.get(f"{API_PREFIX}/usuarios/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["email"] == "admin@test.com"

def test_listar_usuarios(client: TestClient):
    """
    Prueba listar todos los usuarios. Debería haber al menos 2.
    """
    response = client.get(f"{API_PREFIX}/usuarios")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2 # El de conftest y el de este test

def test_actualizar_usuario(client: TestClient):
    """
    Prueba actualizar el usuario creado.
    """
    assert test_usuario_id > 0, "test_crear_usuario debe ejecutarse primero"
    
    update_data = {
        "nombre": "Homer J.",
        "apellido": "Simpson (Actualizado)",
        "activo": False,
        "rol": RolUsuario.RESIDENTE.value # Asumimos que no puedes cambiar a admin
    }
    
    data_input = UsuarioUpdate(**update_data)
    # CORRECCIÓN: Usamos .dict() (Pydantic v1)
    json_payload = data_input.dict(exclude_unset=True)

    response = client.put(f"{API_PREFIX}/usuarios/{test_usuario_id}", json=json_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == update_data["nombre"]
    assert data["activo"] == False
    assert data["rol"] == RolUsuario.RESIDENTE.value

def test_eliminar_usuario(client: TestClient):
    """
    Prueba eliminar el usuario creado.
    """
    assert test_usuario_id > 0, "test_crear_usuario debe ejecutarse primero"
    
    response = client.delete(f"{API_PREFIX}/usuarios/{test_usuario_id}")
    assert response.status_code == 204

def test_obtener_usuario_eliminado(client: TestClient):
    """
    Prueba verificar que el usuario ya no existe.
    """
    assert test_usuario_id > 0, "test_crear_usuario debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/usuarios/{test_usuario_id}")
    assert response.status_code == 404
