from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

# Dependencias de tu aplicación (asumimos que existen)
from app.api.deps import get_db
# from app.api.deps import get_current_user # Descomentar si se necesita autenticación

# Importa el modelo único de Multa
from app.models.multa import Multa

router = APIRouter(prefix="/multas", tags=["Multas"])

# GET /multas - Listar todas
@router.get("", response_model=List[Multa])
async def listar_multas(db: Session = Depends(get_db)):
    """
    Obtiene una lista de todas las multas.
    """
    items = db.exec(select(Multa)).all()
    return items

# POST /multas - Crear
@router.post("", response_model=Multa, status_code=status.HTTP_201_CREATED)
async def crear_multa(data: Multa, db: Session = Depends(get_db)):
    """
    Crea una nueva multa.
    """
    # Creamos la instancia del modelo de DB directamente desde el body
    item = Multa.model_validate(data)
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return item

# GET /multas/{item_id} - Obtener una
@router.get("/{item_id}", response_model=Multa)
async def obtener_multa(item_id: int, db: Session = Depends(get_db)):
    """
    Obtiene una multa específica por su ID.
    """
    item = db.get(Multa, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Multa no encontrada")
    
    return item

# PUT /multas/{item_id} - Actualizar
@router.put("/{item_id}", response_model=Multa)
async def actualizar_multa(item_id: int, data: Multa, db: Session = Depends(get_db)):
    """
    Actualiza una multa existente.
    """
    item = db.get(Multa, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Multa no encontrada")
    
    # Obtenemos los datos del body (data) que el usuario realmente envió
    update_data = data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(item, key, value)
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return item

# DELETE /multas/{item_id} - Eliminar
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_multa(item_id: int, db: Session = Depends(get_db)):
    """
    Elimina una multa por su ID.
    """
    item = db.get(Multa, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Multa no encontrada")
    
    db.delete(item)
    db.commit()
    
    # No se devuelve contenido, solo el status code 204
    return None
