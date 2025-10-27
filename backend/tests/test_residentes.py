from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.residente import Residente
from datetime import date

# Variables globales
test_residente_id = 0
API_PREFIX = "/api/v1" # Prefijo global de la API

def test_crear_residente(client: TestClient):
    """
    Prueba la creación de un nuevo residente.
    """
    global test_residente_id
    
    test_data = {
        "condominio_id": 1, # Asume que el Condominio ID=1 existe (de conftest.py)
        "vivienda_numero": "A-101",
        "nombre": "Bart",
        "apellido": "Simpson",
        "rut": "25.123.456-K",
        "email": "bart@test.com",
        "es_propietario": True,
        "fecha_ingreso": date.today().isoformat(),
        "activo": True
    }
    
    response = client.post(f"{API_PREFIX}/residentes", json=test_data)
    
    assert response.status_code == 201, f"Error: {response.json()}"
    data = response.json()
    assert data["nombre"] == test_data["nombre"]
    assert data["rut"] == test_data["rut"]
    assert data["condominio_id"] == test_data["condominio_id"]
    assert data["id"] is not None
    # No asignamos a 'test_residente_id' el ID=1, que ya existe
    if data["rut"] == test_data["rut"]:
        test_residente_id = data["id"]

def test_obtener_residente(client: TestClient):
    """
    Prueba obtener un residente específico.
    """
    assert test_residente_id > 0, "test_crear_residente debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/residentes/{test_residente_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_residente_id
    assert data["nombre"] == "Bart"

def test_listar_residentes(client: TestClient):
    """
    Prueba listar todos los residentes. (Debe estar el ID=1 de conftest y el nuevo)
    """
    response = client.get(f"{API_PREFIX}/residentes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2

def test_actualizar_residente(client: TestClient):
    """
    Prueba actualizar un residente.
    """
    assert test_residente_id > 0, "test_crear_residente debe ejecutarse primero"
    
    update_data = {
        "condominio_id": 1,
        "vivienda_numero": "A-101 (Actualizado)",
        "nombre": "Bart",
        "apellido": "Simpson",
        "rut": "25.123.456-K",
        "email": "bart.simpson@test.com", # Email actualizado
        "es_propietario": False, # Actualizado
        "fecha_ingreso": date.today().isoformat(),
        "activo": False # Actualizado
    }
    
    response = client.put(f"{API_PREFIX}/residentes/{test_residente_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == update_data["email"]
    assert data["es_propietario"] == False
    assert data["activo"] == False

def test_eliminar_residente(client: TestClient):
    """
    Prueba eliminar un residente.
    """
    assert test_residente_id > 0, "test_crear_residente debe ejecutarse primero"
    
    response = client.delete(f"{API_PREFIX}/residentes/{test_residente_id}")
    assert response.status_code == 204

def test_obtener_residente_eliminado(client: TestClient):
    """
    Prueba verificar que el residente ya no existe.
    """
    assert test_residente_id > 0, "test_crear_residente debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/residentes/{test_residente_id}")
    assert response.status_code == 404
