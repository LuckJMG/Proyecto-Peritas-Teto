from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.reserva import Reserva, EstadoReserva
from datetime import date, time, datetime

# Variables globales
test_reserva_id = 0
API_PREFIX = "/api/v1" # Prefijo global de la API

def test_crear_reserva(client: TestClient):
    """
    Prueba la creación de una nueva reserva.
    """
    global test_reserva_id
    
    test_data = {
        # CORRECCIÓN: Usamos IDs base creados en conftest_v5.py
        "espacio_comun_id": 1, 
        "residente_id": 1,
        # ---
        "fecha_reserva": date.today().isoformat(),
        "hora_inicio": time(18, 0, 0).isoformat(),
        "hora_fin": time(22, 0, 0).isoformat(),
        "estado": EstadoReserva.CONFIRMADA.value,
        "monto_pago": 15000.00,
        "fecha_creacion": datetime.now().isoformat() # Asumiendo que el modelo lo acepta
    }
    
    response = client.post(f"{API_PREFIX}/reservas", json=test_data)
    
    assert response.status_code == 201, f"Error: {response.json()}"
    data = response.json()
    assert data["espacio_comun_id"] == test_data["espacio_comun_id"]
    assert data["residente_id"] == test_data["residente_id"]
    assert data["estado"] == test_data["estado"]
    assert data["id"] is not None
    test_reserva_id = data["id"]

def test_obtener_reserva(client: TestClient):
    """
    Prueba obtener una reserva específica.
    """
    assert test_reserva_id > 0, "test_crear_reserva debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/reservas/{test_reserva_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_reserva_id
    assert data["hora_inicio"] == time(18, 0, 0).isoformat()

def test_listar_reservas(client: TestClient):
    """
    Prueba listar todas las reservas.
    """
    response = client.get(f"{API_PREFIX}/reservas")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_actualizar_reserva(client: TestClient):
    """
    Prueba actualizar una reserva (cancelarla).
    """
    assert test_reserva_id > 0, "test_crear_reserva debe ejecutarse primero"
    
    update_data = {
        "espacio_comun_id": 1, 
        "residente_id": 1,
        "fecha_reserva": date.today().isoformat(),
        "hora_inicio": time(18, 0, 0).isoformat(),
        "hora_fin": time(22, 0, 0).isoformat(),
        "estado": EstadoReserva.CANCELADA.value, # <-- Actualizado
        "monto_pago": 15000.00,
        "fecha_creacion": datetime.now().isoformat()
    }
    
    response = client.put(f"{API_PREFIX}/reservas/{test_reserva_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["estado"] == EstadoReserva.CANCELADA.value
    assert data["id"] == test_reserva_id

def test_eliminar_reserva(client: TestClient):
    """
    Prueba eliminar una reserva.
    """
    assert test_reserva_id > 0, "test_crear_reserva debe ejecutarse primero"
    
    response = client.delete(f"{API_PREFIX}/reservas/{test_reserva_id}")
    assert response.status_code == 204

def test_obtener_reserva_eliminada(client: TestClient):
    """
    Prueba verificar que la reserva ya no existe.
    """
    assert test_reserva_id > 0, "test_crear_reserva debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/reservas/{test_reserva_id}")
    assert response.status_code == 404
