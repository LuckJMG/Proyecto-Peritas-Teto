from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.multa import Multa, TipoMulta, EstadoMulta
from datetime import date

# Variables globales
test_multa_id = 0
API_PREFIX = "/api/v1" # Prefijo global de la API

def test_crear_multa(client: TestClient):
    """
    Prueba la creación de una nueva multa.
    """
    global test_multa_id
    
    test_data = {
        # CORRECCIÓN: Usamos IDs base creados en conftest_v5.py
        "residente_id": 1, 
        "condominio_id": 1,
        "creado_por": 1,
        # ---
        "tipo": TipoMulta.RUIDO.value,
        "descripcion": "Fiesta ruidosa después de la medianoche",
        "monto": 50000.00,
        "estado": EstadoMulta.PENDIENTE.value,
        "fecha_emision": date.today().isoformat()
    }
    
    response = client.post(f"{API_PREFIX}/multas", json=test_data)
    
    assert response.status_code == 201, f"Error: {response.json()}"
    data = response.json()
    assert data["descripcion"] == test_data["descripcion"]
    assert data["monto"] == test_data["monto"]
    assert data["residente_id"] == test_data["residente_id"]
    assert data["id"] is not None
    test_multa_id = data["id"]

def test_obtener_multa(client: TestClient):
    """
    Prueba obtener una multa específica.
    """
    assert test_multa_id > 0, "test_crear_multa debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/multas/{test_multa_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_multa_id
    assert data["tipo"] == TipoMulta.RUIDO.value

def test_listar_multas(client: TestClient):
    """
    Prueba listar todas las multas.
    """
    response = client.get(f"{API_PREFIX}/multas")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_actualizar_multa(client: TestClient):
    """
    Prueba actualizar una multa (pagarla).
    """
    assert test_multa_id > 0, "test_crear_multa debe ejecutarse primero"
    
    update_data = {
        "residente_id": 1, 
        "condominio_id": 1,
        "creado_por": 1,
        "tipo": TipoMulta.RUIDO.value,
        "descripcion": "Fiesta ruidosa después de la medianoche",
        "monto": 50000.00,
        "estado": EstadoMulta.PAGADA.value, # <-- Actualizado
        "fecha_emision": date.today().isoformat()
    }
    
    response = client.put(f"{API_PREFIX}/multas/{test_multa_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["estado"] == EstadoMulta.PAGADA.value
    assert data["id"] == test_multa_id

def test_eliminar_multa(client: TestClient):
    """
    Prueba eliminar una multa.
    """
    assert test_multa_id > 0, "test_crear_multa debe ejecutarse primero"
    
    response = client.delete(f"{API_PREFIX}/multas/{test_multa_id}")
    assert response.status_code == 204

def test_obtener_multa_eliminada(client: TestClient):
    """
    Prueba verificar que la multa ya no existe.
    """
    assert test_multa_id > 0, "test_crear_multa debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/multas/{test_multa_id}")
    assert response.status_code == 404
