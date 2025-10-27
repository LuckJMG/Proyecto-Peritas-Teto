from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.pago import Pago, EstadoPago, TipoPago, MetodoPago
from datetime import datetime

# Variables globales
test_pago_id = 0
API_PREFIX = "/api/v1" # Prefijo global de la API

def test_crear_pago(client: TestClient):
    """
    Prueba la creación de un nuevo pago.
    """
    global test_pago_id
    
    test_data = {
        # CORRECCIÓN: Usamos IDs base creados en conftest_v5.py
        "residente_id": 1,
        "condominio_id": 1,
        # ---
        "monto": 10000.00,
        "fecha_emision": datetime.now().isoformat(),
        "tipo": TipoPago.GASTO_COMUN.value,
        "metodo_pago": MetodoPago.TRANSFERENCIA.value,
        "estado_pago": EstadoPago.PENDIENTE.value
    }
    
    response = client.post(f"{API_PREFIX}/pagos", json=test_data)
    
    assert response.status_code == 201, f"Error: {response.json()}"
    data = response.json()
    assert data["monto"] == test_data["monto"]
    assert data["residente_id"] == test_data["residente_id"]
    assert data["registrado_por"] == 1 # Debe ser el current_user (ID=1)
    assert data["id"] is not None
    test_pago_id = data["id"]

def test_obtener_pago(client: TestClient):
    """
    Prueba obtener un pago específico.
    """
    assert test_pago_id > 0, "test_crear_pago debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/pagos/{test_pago_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_pago_id
    assert data["monto"] == 10000.00

def test_listar_pagos(client: TestClient):
    """
    Prueba listar todos los pagos.
    """
    response = client.get(f"{API_PREFIX}/pagos")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_actualizar_pago(client: TestClient):
    """
    Prueba actualizar un pago (aprobarlo).
    """
    assert test_pago_id > 0, "test_crear_pago debe ejecutarse primero"
    
    update_data = {
        "residente_id": 1,
        "condominio_id": 1,
        "monto": 10000.00,
        "fecha_emision": datetime.now().isoformat(),
        "tipo": TipoPago.GASTO_COMUN.value,
        "metodo_pago": MetodoPago.TRANSFERENCIA.value,
        "estado_pago": EstadoPago.APROBADO.value # <-- Actualizado
    }
    
    response = client.put(f"{API_PREFIX}/pagos/{test_pago_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["estado_pago"] == EstadoPago.APROBADO.value
    assert data["id"] == test_pago_id

def test_eliminar_pago_aprobado_falla(client: TestClient):
    """
    Prueba que no se puede eliminar un pago APROBADO.
    """
    assert test_pago_id > 0, "test_actualizar_pago debe ejecutarse primero"
    
    response = client.delete(f"{API_PREFIX}/pagos/{test_pago_id}")
    assert response.status_code == 400 # Bad Request

def test_eliminar_pago(client: TestClient):
    """
    Prueba eliminar un pago (primero lo volvemos a PENDIENTE).
    """
    assert test_pago_id > 0, "test_crear_pago debe ejecutarse primero"
    
    # Paso 1: Volver a PENDIENTE para poder borrarlo
    update_data = {
        "residente_id": 1,
        "condominio_id": 1,
        "monto": 10000.00,
        "tipo": TipoPago.GASTO_COMUN.value,
        "metodo_pago": MetodoPago.TRANSFERENCIA.value,
        "estado_pago": EstadoPago.PENDIENTE.value 
    }
    response_put = client.put(f"{API_PREFIX}/pagos/{test_pago_id}", json=update_data)
    assert response_put.status_code == 200
    
    # Paso 2: Eliminar
    response_del = client.delete(f"{API_PREFIX}/pagos/{test_pago_id}")
    assert response_del.status_code == 204
