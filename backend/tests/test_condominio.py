from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.condominio import Condominio
from datetime import datetime

# Variables globales
test_condominio_id = 0
API_PREFIX = "/api/v1" # Prefijo global de la API

def test_crear_condominio(client: TestClient):
    """
    Prueba la creación de un nuevo condominio.
    """
    global test_condominio_id
    
    test_data = {
        "nombre": "Condominio Los Héroes",
        "direccion": "Avenida Siempre Viva 742",
        "total_viviendas": 150,
        "activo": True,
    }
    
    response = client.post(f"{API_PREFIX}/condominios", json=test_data)
    
    assert response.status_code == 201, f"Error: {response.json()}"
    data = response.json()
    assert data["nombre"] == test_data["nombre"]
    assert data["direccion"] == test_data["direccion"]
    assert data["id"] is not None
    test_condominio_id = data["id"] # Guardamos el ID para tests futuros

def test_obtener_condominio_creado(client: TestClient):
    """
    Prueba obtener el condominio recién creado.
    """
    assert test_condominio_id > 0, "test_crear_condominio debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/condominios/{test_condominio_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_condominio_id
    assert data["nombre"] == "Condominio Los Héroes"

def test_obtener_condominio_base(client: TestClient):
    """
    Prueba obtener el condominio base (ID=1) creado en conftest.py.
    """
    response = client.get(f"{API_PREFIX}/condominios/1")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == 1
    assert data["nombre"] == "Condo Test" 

def test_listar_condominios(client: TestClient):
    """
    Prueba listar todos los condominios. Debería haber al menos 2.
    """
    response = client.get(f"{API_PREFIX}/condominios")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2 

def test_actualizar_condominio(client: TestClient):
    """
    Prueba actualizar el condominio creado.
    """
    assert test_condominio_id > 0, "test_crear_condominio debe ejecutarse primero"
    
    update_data = {
        "nombre": "Condominio Los Héroes (Actualizado)",
        "direccion": "Avenida Siempre Viva 742, Springfield",
        "total_viviendas": 155,
        "activo": False,
    }
    
    response = client.put(f"{API_PREFIX}/condominios/{test_condominio_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == update_data["nombre"]
    assert data["total_viviendas"] == 155
    assert data["activo"] == False

def test_eliminar_condominio(client: TestClient):
    """
    Prueba eliminar el condominio creado.
    """
    assert test_condominio_id > 0, "test_crear_condominio debe ejecutarse primero"
    
    response = client.delete(f"{API_PREFIX}/condominios/{test_condominio_id}")
    assert response.status_code == 204

def test_obtener_condominio_eliminado(client: TestClient):
    """
    Prueba verificar que el condominio ya no existe.
    """
    assert test_condominio_id > 0, "test_crear_condominio debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/condominios/{test_condominio_id}")
    assert response.status_code == 404
