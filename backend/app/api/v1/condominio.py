from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

# Dependencias
from app.api.deps import get_db


from app.models.condominio import Condominio

router = APIRouter(prefix="/condominios", tags=["Condominios"])

# GET /condominios - Listar todos
@router.get("", response_model=List[Condominio])
async def listar_condominios(db: Session = Depends(get_db)):
    """
    Obtiene una lista de todos los condominios.
    """
    items = db.exec(select(Condominio)).all()
    return items

# POST /condominios - Crear
@router.post("", response_model=Condominio, status_code=status.HTTP_201_CREATED)
async def crear_condominio(data: Condominio, db: Session = Depends(get_db)):
    """
    Crea un nuevo condominio.
    ADVERTENCIA: Este enfoque permite al cliente enviar campos como 'id'
    o 'fecha_creacion'. SQLModel/Pydantic los validará.
    """
    # Creamos la instancia del modelo de DB directamente desde el body
    # El 'data' ya es una instancia de 'Condominio' gracias a FastAPI
    item = Condominio.model_validate(data)
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return item

# GET /condominios/{item_id} - Obtener uno
@router.get("/{item_id}", response_model=Condominio)
async def obtener_condominio(item_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un condominio específico por su ID.
    """
    item = db.get(Condominio, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Condominio no encontrado")
    
    return item

# PUT /condominios/{item_id} - Actualizar
@router.put("/{item_id}", response_model=Condominio)
async def actualizar_condominio(item_id: int, data: Condominio, db: Session = Depends(get_db)):
    """
    Actualiza un condominio existente.
    """
    item = db.get(Condominio, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Condominio no encontrado")
    
    # Obtenemos los datos del body (data) que el usuario realmente envió
    update_data = data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(item, key, value)
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return item

# DELETE /condominios/{item_id} - Eliminar
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_condominio(item_id: int, db: Session = Depends(get_db)):
    """
    Elimina un condominio por su ID.
    """
    item = db.get(Condominio, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Condominio no encontrado")
    
    db.delete(item)
    db.commit()
    
    # No se devuelve contenido, solo el status code 204
    return None
