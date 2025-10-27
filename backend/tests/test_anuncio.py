from fastapi.testclient import TestClient
from sqlmodel import Session
# CORRECCIÓN: Importamos el schema que usa el endpoint
from app.schemas.anuncio import AnuncioInput
from datetime import datetime

# Variables globales
test_anuncio_id = 0
API_PREFIX = "/api/v1" # Prefijo global de la API

def test_crear_anuncio(client: TestClient):
    """
    Prueba la creación de un nuevo anuncio.
    """
    global test_anuncio_id
    
    test_data = {
        # CORRECCIÓN: Enviamos los campos que AnuncioInput requiere
        "condominio_id": 1,
        "creado_por": 1,
        # ---
        "titulo": "Corte de Agua Programado",
        "descripcion": "Se informa corte de agua para el día de mañana.",
        "tipo": "Aviso", # Usamos string ya que TipoAnuncio no existe
        "publicado": True
    }
    
    # CORRECCIÓN: Usamos .dict() (Pydantic v1) para coincidir con tu endpoint
    data_input = AnuncioInput(**test_data)
    json_payload = data_input.dict()

    response = client.post(f"{API_PREFIX}/anuncios", json=json_payload)
    
    assert response.status_code == 201, f"Error: {response.json()}"
    data = response.json()
    assert data["titulo"] == test_data["titulo"]
    assert data["tipo"] == test_data["tipo"]
    assert data["condominio_id"] == test_data["condominio_id"]
    assert data["id"] is not None
    test_anuncio_id = data["id"]

def test_obtener_anuncio(client: TestClient):
    """
    Prueba obtener un anuncio específico.
    """
    assert test_anuncio_id > 0, "test_crear_anuncio debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/anuncios/{test_anuncio_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_anuncio_id
    assert data["titulo"] == "Corte de Agua Programado"

def test_listar_anuncios(client: TestClient):
    """
    Prueba listar todos los anuncios.
    """
    response = client.get(f"{API_PREFIX}/anuncios")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_actualizar_anuncio(client: TestClient):
    """
    Prueba actualizar un anuncio.
    """
    assert test_anuncio_id > 0, "test_crear_anuncio debe ejecutarse primero"
    
    update_data = {
        "condominio_id": 1,
        "creado_por": 1,
        "titulo": "Corte de Agua (REPROGRAMADO)", # <-- Actualizado
        "descripcion": "Se informa corte de agua para el día de mañana.",
        "tipo": "Urgente", # <-- Actualizado
        "publicado": True
    }
    
    data_input = AnuncioInput(**update_data)
    json_payload = data_input.dict(exclude_unset=True)
    
    response = client.put(f"{API_PREFIX}/anuncios/{test_anuncio_id}", json=json_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["titulo"] == update_data["titulo"]
    assert data["tipo"] == update_data["tipo"]

def test_eliminar_anuncio(client: TestClient):
    """
    Prueba eliminar un anuncio.
    """
    assert test_anuncio_id > 0, "test_crear_anuncio debe ejecutarse primero"
    
    response = client.delete(f"{API_PREFIX}/anuncios/{test_anuncio_id}")
    assert response.status_code == 204

def test_obtener_anuncio_eliminado(client: TestClient):
    """
    Prueba verificar que el anuncio ya no existe.
    """
    assert test_anuncio_id > 0, "test_crear_anuncio debe ejecutarse primero"
    
    response = client.get(f"{API_PREFIX}/anuncios/{test_anuncio_id}")
    assert response.status_code == 404
