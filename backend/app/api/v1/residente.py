# backend/app/api/v1/residentes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.api.deps import get_db
from app.models.residente import Residente

router = APIRouter(prefix="/residentes", tags=["Residentes"])

# GET /residentes - Listar todos
@router.get("", response_model=List[Residente])
async def listar_residentes(db: Session = Depends(get_db)):
    items = db.exec(select(Residente)).all()
    return items

# POST /residentes - Crear
@router.post("", response_model=Residente, status_code=status.HTTP_201_CREATED)
async def crear_residente(data: Residente, db: Session = Depends(get_db)):
    # Validar que el condominio existe
    from app.models.condominio import Condominio
    condominio = db.get(Condominio, data.condominio_id)
    if not condominio:
        raise HTTPException(
            status_code=404, 
            detail=f"Condominio con id {data.condominio_id} no encontrado"
        )
    
    # Validar que el usuario existe (si se proporcionó)
    if data.usuario_id:
        from app.models.usuario import Usuario
        usuario = db.get(Usuario, data.usuario_id)
        if not usuario:
            raise HTTPException(
                status_code=404, 
                detail=f"Usuario con id {data.usuario_id} no encontrado"
            )
    
    # Validar que el RUT no esté duplicado
    existing_rut = db.exec(
        select(Residente).where(Residente.rut == data.rut)
    ).first()
    if existing_rut:
        raise HTTPException(
            status_code=400, 
            detail=f"Ya existe un residente con el RUT {data.rut}"
        )
    
    # Validar que el email no esté duplicado en el mismo condominio
    existing_email = db.exec(
        select(Residente).where(
            Residente.email == data.email,
            Residente.condominio_id == data.condominio_id
        )
    ).first()
    if existing_email:
        raise HTTPException(
            status_code=400, 
            detail=f"Ya existe un residente con el email {data.email} en este condominio"
        )
    
    db.add(data)
    db.commit()
    db.refresh(data)
    return data

# GET /residentes/{item_id} - Obtener uno
@router.get("/{item_id}", response_model=Residente)
async def obtener_residente(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Residente, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Residente no encontrado")
    return item

# PUT /residentes/{item_id} - Actualizar
@router.put("/{item_id}", response_model=Residente)
async def actualizar_residente(item_id: int, data: Residente, db: Session = Depends(get_db)):
    item = db.get(Residente, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Residente no encontrado")
    
    # Validar condominio si se está cambiando
    if data.condominio_id != item.condominio_id:
        from app.models.condominio import Condominio
        condominio = db.get(Condominio, data.condominio_id)
        if not condominio:
            raise HTTPException(
                status_code=404, 
                detail=f"Condominio con id {data.condominio_id} no encontrado"
            )
    
    # Validar usuario si se está cambiando
    if data.usuario_id and data.usuario_id != item.usuario_id:
        from app.models.usuario import Usuario
        usuario = db.get(Usuario, data.usuario_id)
        if not usuario:
            raise HTTPException(
                status_code=404, 
                detail=f"Usuario con id {data.usuario_id} no encontrado"
            )
    
    # Validar RUT único si se está cambiando
    if data.rut != item.rut:
        existing_rut = db.exec(
            select(Residente).where(
                Residente.rut == data.rut,
                Residente.id != item_id
            )
        ).first()
        if existing_rut:
            raise HTTPException(
                status_code=400, 
                detail=f"Ya existe un residente con el RUT {data.rut}"
            )
    
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
    item = db.get(Residente, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Residente no encontrado")
    
    db.delete(item)
    db.commit()
    return None