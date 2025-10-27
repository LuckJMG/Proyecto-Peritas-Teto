# backend/app/api/v1/pagos.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Optional, List
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.models.pago import (
    Pago,
    EstadoPago,
    TipoPago,
    MetodoPago
)

router = APIRouter(prefix="/pagos", tags=["Pagos"])

# GET /pagos - Listar todos
@router.get("", response_model=List[Pago])
async def listar_pagos(
    condominio_id: Optional[int] = None,
    residente_id: Optional[int] = None,
    tipo: Optional[str] = None,
    estado_pago: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = select(Pago)
    
    if condominio_id:
        query = query.where(Pago.condominio_id == condominio_id)
    if residente_id:
        query = query.where(Pago.residente_id == residente_id)
    if tipo:
        query = query.where(Pago.tipo == tipo)
    if estado_pago:
        query = query.where(Pago.estado_pago == estado_pago)
    
    items = db.exec(query).all()
    return items

# POST /pagos - Crear
@router.post("", response_model=Pago, status_code=status.HTTP_201_CREATED)
async def crear_pago(
    pago: Pago, 
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    pago.registrado_por = current_user.id
    pago.fecha_pago = datetime.utcnow()
    
    db.add(pago)
    db.commit()
    db.refresh(pago)
    return pago

# GET /pagos/{id} - Obtener uno
@router.get("/{pago_id}", response_model=Pago)
async def obtener_pago(pago_id: int, db: Session = Depends(get_db)):
    item = db.get(Pago, pago_id)
    if not item:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    return item

# PUT /pagos/{id} - Actualizar
@router.put("/{pago_id}", response_model=Pago)
async def actualizar_pago(
    pago_id: int, 
    pago: Pago, 
    db: Session = Depends(get_db)
):
    item = db.get(Pago, pago_id)
    if not item:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    
    if item.estado_pago != EstadoPago.PENDIENTE:
        raise HTTPException(
            status_code=400, 
            detail="Solo se pueden actualizar pagos en estado PENDIENTE"
        )
    
    pago_data = pago.dict(exclude_unset=True)
    for key, value in pago_data.items():
        setattr(item, key, value)
    
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

# DELETE /pagos/{id} - Eliminar
@router.delete("/{pago_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_pago(pago_id: int, db: Session = Depends(get_db)):
    item = db.get(Pago, pago_id)
    if not item:
        raise HTTPException(status_code=404, detail="Pago no encontrado")
    
    if item.estado_pago == EstadoPago.APROBADO:
        raise HTTPException(
            status_code=400, 
            detail="No se pueden eliminar pagos aprobados"
        )
    
    db.delete(item)
    db.commit()
    return None