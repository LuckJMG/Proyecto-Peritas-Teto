from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

# Dependencias
from app.api.deps import get_db

# Importar el modelo 
from app.models.residente import Residente

router = APIRouter(prefix="/residentes", tags=["Residentes"])

# GET /residentes - Listar todos
@router.get("", response_model=List[Residente])
async def listar_residentes(db: Session = Depends(get_db)):
    """
    Obtiene una lista de todos los residentes.
    """
    items = db.exec(select(Residente)).all()
    return items

# POST /residentes - Crear
@router.post("", response_model=Residente, status_code=status.HTTP_201_CREATED)
async def crear_residente(data: Residente, db: Session = Depends(get_db)):
    """
    Crea un nuevo residente.
    """
    # Creamos la instancia del modelo de DB directamente desde el body
    item = Residente.model_validate(data)
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return item

# GET /residentes/{item_id} - Obtener uno
@router.get("/{item_id}", response_model=Residente)
async def obtener_residente(item_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un residente específico por su ID.
    """
    item = db.get(Residente, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Residente no encontrado")
    
    return item

# PUT /residentes/{item_id} - Actualizar
@router.put("/{item_id}", response_model=Residente)
async def actualizar_residente(item_id: int, data: Residente, db: Session = Depends(get_db)):
    """
    Actualiza un residente existente.
    """
    item = db.get(Residente, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Residente no encontrado")
    
    # Obtenemos los datos del body (data) que el usuario realmente envió
    update_data = data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(item, key, value)
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return item

# DELETE /residentes/{item_id} - Eliminar
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_residente(item_id: int, db: Session = Depends(get_db)):
    """
    Elimina un residente por su ID.
    """
    item = db.get(Residente, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Residente no encontrado")
    
    db.delete(item)
    db.commit()
    
    # No se devuelve contenido, solo el status code 204
    return None