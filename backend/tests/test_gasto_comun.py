from fastapi.testclient import TestClient
from sqlmodel import Session
# CORRECCIÓN: Importamos el schema que usa el endpoint
from app.schemas.gasto_comun import GastoComunInput
from datetime import date

# Variables globales
test_gasto_comun_id = 0
API_PREFIX = "/api/v1" # Prefijo global de la API

def test_crear_gasto_comun(client: TestClient):
    """
    Prueba la creación de un nuevo gasto común.
    """
    global test_gasto_comun_id
    
    test_data = {
        # CORRECCIÓN: Usamos IDs base creados en conftest_v5.py
        "condominio_id": 1,
        "residente_id": 1,
        # ---
        "monto": 75000,
        "mes": date.today().month,
        "ano": date.today().year,
        "tipo": "Ordinario", # Usamos string ya que TipoGasto no existe
        "descripcion": "Gasto común mensual"
    }
    
    # CORRECCIÓN: Usamos .dict() (Pydantic v1) para coincidir con tu endpoint
    data_input = GastoComunInput(**test_data)
    json_payload = data_input.dict()

    response = client.post(f"{API_PREFIX}/gastos-comunes", json=json_payload)
    
    assert response.status_code == 201, f"Error: {response.json()}"
    data = response.json()
    assert data["monto"] == test_data["monto"]
    assert data["residente_id"] == test_data["residente_id"]
    assert data["tipo"] == test_data["tipo"]
    assert data["id"] is not None
    test_gasto_comun_id = data["id"]

def test_obtener_gasto_comun(client: TestClient):
    """
    Prueba obtener un gasto común específico.
    """
    assert test_gasto_comun_id > 0, "test_crear_gasto_comun debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/gastos-comunes/{test_gasto_comun_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_gasto_comun_id
    assert data["monto"] == 75000

def test_listar_gastos_comunes(client: TestClient):
    """
    Prueba listar todos los gastos comunes.
    """
    response = client.get(f"{API_PREFIX}/gastos-comunes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_actualizar_gasto_comun(client: TestClient):
    """
    Prueba actualizar un gasto común.
    """
    assert test_gasto_comun_id > 0, "test_crear_gasto_comun debe ejecutarse primero"
    
    update_data = {
        "condominio_id": 1,
        "residente_id": 1,
        "monto": 80000, # <-- Actualizado
        "mes": date.today().month,
        "ano": date.today().year,
        "tipo": "Ordinario",
        "descripcion": "Gasto común mensual (reajustado)" # <-- Actualizado
    }
    
    data_input = GastoComunInput(**update_data)
    json_payload = data_input.dict(exclude_unset=True)

    response = client.put(f"{API_PREFIX}/gastos-comunes/{test_gasto_comun_id}", json=json_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["monto"] == 80000
    assert data["descripcion"] == update_data["descripcion"]

def test_eliminar_gasto_comun(client: TestClient):
    """
    Prueba eliminar un gasto común.
    """
    assert test_gasto_comun_id > 0, "test_crear_gasto_comun debe ejecutarse primero"
    
    response = client.delete(f"{API_PREFIX}/gastos-comunes/{test_gasto_comun_id}")
    assert response.status_code == 204

def test_obtener_gasto_comun_eliminado(client: TestClient):
    """
    Prueba verificar que el gasto común ya no existe.
    """
    assert test_gasto_comun_id > 0, "test_crear_gasto_comun debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/gastos-comunes/{test_gasto_comun_id}")
    assert response.status_code == 404
