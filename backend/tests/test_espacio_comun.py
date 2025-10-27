from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.espacio_comun import EspacioComun, TipoEspacioComun
from datetime import date

# Variables globales
test_espacio_comun_id = 0
API_PREFIX = "/api/v1" # Prefijo global de la API

def test_crear_espacio_comun(client: TestClient):
    """
    Prueba la creación de un nuevo espacio común.
    """
    global test_espacio_comun_id
    
    test_data = {
        # CORRECCIÓN: Enviamos el condominio_id para evitar IntegrityError
        "condominio_id": 1, 
        "nombre": "Sala de Eventos Principal",
        "tipo": TipoEspacioComun.SALA_EVENTOS.value,
        "capacidad": 50,
        "costo_por_hora": 15000,
        "activo": True,
        "requiere_pago": True
    }
    
    response = client.post(f"{API_PREFIX}/espacios-comunes", json=test_data)
    
    assert response.status_code == 201, f"Error: {response.json()}"
    data = response.json()
    assert data["nombre"] == test_data["nombre"]
    assert data["tipo"] == test_data["tipo"]
    assert data["condominio_id"] == test_data["condominio_id"]
    assert data["id"] is not None
    # No asignamos a 'test_espacio_comun_id' el ID=1, que ya existe
    if data["nombre"] == test_data["nombre"]:
        test_espacio_comun_id = data["id"]

def test_obtener_espacio_comun(client: TestClient):
    """
    Prueba obtener un espacio común específico.
    """
    assert test_espacio_comun_id > 0, "test_crear_espacio_comun debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/espacios-comunes/{test_espacio_comun_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_espacio_comun_id
    assert data["nombre"] == "Sala de Eventos Principal"

def test_listar_espacios_comunes(client: TestClient):
    """
    Prueba listar todos los espacios comunes. (Debe estar el ID=1 de conftest y el nuevo)
    """
    response = client.get(f"{API_PREFIX}/espacios-comunes")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2

def test_actualizar_espacio_comun(client: TestClient):
    """
    Prueba actualizar un espacio común.
    """
    assert test_espacio_comun_id > 0, "test_crear_espacio_comun debe ejecutarse primero"
    
    update_data = {
        "condominio_id": 1,
        "nombre": "Sala de Eventos (Renovada)",
        "tipo": TipoEspacioComun.SALA_EVENTOS.value,
        "capacidad": 55,
        "costo_por_hora": 16000,
        "activo": False, # Actualizado
        "requiere_pago": True
    }
    
    response = client.put(f"{API_PREFIX}/espacios-comunes/{test_espacio_comun_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["nombre"] == update_data["nombre"]
    assert data["capacidad"] == 55
    assert data["activo"] == False

def test_eliminar_espacio_comun(client: TestClient):
    """
    Prueba eliminar un espacio común.
    """
    assert test_espacio_comun_id > 0, "test_crear_espacio_comun debe ejecutarse primero"
    
    response = client.delete(f"{API_PREFIX}/espacios-comunes/{test_espacio_comun_id}")
    assert response.status_code == 204

def test_obtener_espacio_comun_eliminado(client: TestClient):
    """
    Prueba verificar que el espacio común ya no existe.
    """
    assert test_espacio_comun_id > 0, "test_crear_espacio_comun debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/espacios-comunes/{test_espacio_comun_id}")
    assert response.status_code == 404
