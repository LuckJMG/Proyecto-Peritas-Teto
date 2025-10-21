# backend/app/api/v1/template.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.api.deps import get_db, get_current_user
from app.models.tu_modelo import TuModelo as TuModeloDB

# Esquemas generados
from src.app.models.tu_modelo import TuModelo
from src.app.models.tu_modelo_input import TuModeloInput
from src.app.models.tu_modelos_get200_response import TuModelosGet200Response

router = APIRouter(prefix="/tu-recurso", tags=["Tu Recurso"])

# GET /tu-recurso - Listar todos
@router.get("", response_model=TuModelosGet200Response)
async def listar(db: Session = Depends(get_db)):
    items = db.exec(select(TuModeloDB)).all()
    data = [TuModelo.from_orm(item) for item in items]
    return TuModelosGet200Response(data=data)

# POST /tu-recurso - Crear
@router.post("", response_model=TuModelo, status_code=status.HTTP_201_CREATED)
async def crear(data: TuModeloInput, db: Session = Depends(get_db)):
    item = TuModeloDB(**data.dict())
    db.add(item)
    db.commit()
    db.refresh(item)
    return TuModelo.from_orm(item)

# GET /tu-recurso/{id} - Obtener uno
@router.get("/{item_id}", response_model=TuModelo)
async def obtener(item_id: int, db: Session = Depends(get_db)):
    item = db.get(TuModeloDB, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    return TuModelo.from_orm(item)

# PUT /tu-recurso/{id} - Actualizar
@router.put("/{item_id}", response_model=TuModelo)
async def actualizar(item_id: int, data: TuModeloInput, db: Session = Depends(get_db)):
    item = db.get(TuModeloDB, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(item, key, value)
    
    db.add(item)
    db.commit()
    db.refresh(item)
    return TuModelo.from_orm(item)

# DELETE /tu-recurso/{id} - Eliminar
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar(item_id: int, db: Session = Depends(get_db)):
    item = db.get(TuModeloDB, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="No encontrado")
    
    db.delete(item)
    db.commit()
    return None