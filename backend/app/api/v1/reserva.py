from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

# Dependencias
from app.api.deps import get_db

# Importar el modelo
from app.models.reserva import Reserva

router = APIRouter(prefix="/reservas", tags=["Reservas"])

# GET /reservas - Listar todas
@router.get("", response_model=List[Reserva])
async def listar_reservas(db: Session = Depends(get_db)):
    """
    Obtiene una lista de todas las reservas.
    """
    items = db.exec(select(Reserva)).all()
    return items

# POST /reservas - Crear
@router.post("", response_model=Reserva, status_code=status.HTTP_201_CREATED)
async def crear_reserva(data: Reserva, db: Session = Depends(get_db)):
    """
    Crea una nueva reserva.
    """
    # Creamos la instancia del modelo de DB directamente desde el body
    item = Reserva.model_validate(data)
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return item

# GET /reservas/{item_id} - Obtener una
@router.get("/{item_id}", response_model=Reserva)
async def obtener_reserva(item_id: int, db: Session = Depends(get_db)):
    """
    Obtiene una reserva específica por su ID.
    """
    item = db.get(Reserva, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    return item

# PUT /reservas/{item_id} - Actualizar
@router.put("/{item_id}", response_model=Reserva)
async def actualizar_reserva(item_id: int, data: Reserva, db: Session = Depends(get_db)):
    """
    Actualiza una reserva existente.
    """
    item = db.get(Reserva, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    # Obtenemos los datos del body (data) que el usuario realmente envió
    update_data = data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(item, key, value)
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return item

# DELETE /reservas/{item_id} - Eliminar
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_reserva(item_id: int, db: Session = Depends(get_db)):
    """
    Elimina una reserva por su ID.
    """
    item = db.get(Reserva, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    db.delete(item)
    db.commit()
    
    # No se devuelve contenido, solo el status code 204
    return None
