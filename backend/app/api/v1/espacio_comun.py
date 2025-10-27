from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

# Dependencias
from app.api.deps import get_db

# Importar el modelo
from app.models.espacio_comun import EspacioComun

router = APIRouter(prefix="/espacios-comunes", tags=["Espacios Comunes"])

# GET /espacios-comunes - Listar todos
@router.get("", response_model=List[EspacioComun])
async def listar_espacios_comunes(db: Session = Depends(get_db)):
    """
    Obtiene una lista de todos los espacios comunes.
    """
    items = db.exec(select(EspacioComun)).all()
    return items

# POST /espacios-comunes - Crear
@router.post("", response_model=EspacioComun, status_code=status.HTTP_201_CREATED)
async def crear_espacio_comun(data: EspacioComun, db: Session = Depends(get_db)):
    """
    Crea un nuevo espacio común.
    """
    # Creamos la instancia del modelo de DB directamente desde el body
    item = EspacioComun.model_validate(data)
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return item

# GET /espacios-comunes/{item_id} - Obtener uno
@router.get("/{item_id}", response_model=EspacioComun)
async def obtener_espacio_comun(item_id: int, db: Session = Depends(get_db)):
    """
    Obtiene un espacio común específico por su ID.
    """
    item = db.get(EspacioComun, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Espacio Común no encontrado")
    
    return item

# PUT /espacios-comunes/{item_id} - Actualizar
@router.put("/{item_id}", response_model=EspacioComun)
async def actualizar_espacio_comun(item_id: int, data: EspacioComun, db: Session = Depends(get_db)):
    """
    Actualiza un espacio común existente.
    """
    item = db.get(EspacioComun, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Espacio Común no encontrado")
    
    # Obtenemos los datos del body (data) que el usuario realmente envió
    update_data = data.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(item, key, value)
    
    db.add(item)
    db.commit()
    db.refresh(item)
    
    return item

# DELETE /espacios-comunes/{item_id} - Eliminar
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_espacio_comun(item_id: int, db: Session = Depends(get_db)):
    """
    Elimina un espacio común por su ID.
    """
    item = db.get(EspacioComun, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Espacio Común no encontrado")
    
    db.delete(item)
    db.commit()
    
    # No se devuelve contenido, solo el status code 204
    return None