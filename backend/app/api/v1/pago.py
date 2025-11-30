# backend/app/api/v1/pagos.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import Optional, List
from datetime import datetime

from app.api.deps import get_db, get_current_user
from app.models.pago import (
    Pago,
    PagoCreate, # Importamos el nuevo esquema
    EstadoPago
)
from app.models.residente import Residente # Necesitamos esto para buscar al residente

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

# POST /pagos - Crear (ACTUALIZADO)
@router.post("", response_model=Pago, status_code=status.HTTP_201_CREATED)
async def crear_pago(
    pago_in: PagoCreate, # Usamos el esquema de entrada
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. Determinar el residente_id real
    residente_id_final = pago_in.residente_id

    # Si el usuario es un RESIDENTE, ignoramos el ID que mande y buscamos su propio registro de residente
    if current_user.rol == "RESIDENTE":
        statement = select(Residente).where(Residente.usuario_id == current_user.id)
        residente_db = db.exec(statement).first()
        
        if not residente_db:
            raise HTTPException(
                status_code=400, 
                detail="El usuario actual no tiene un perfil de residente asociado."
            )
        residente_id_final = residente_db.id
    
    # Si no es residente (es admin) y no mandó ID, error
    elif not residente_id_final:
         raise HTTPException(status_code=400, detail="Debe especificar el residente_id")

    # 2. Crear la instancia de Base de Datos
    pago = Pago(
        condominio_id=pago_in.condominio_id,
        residente_id=residente_id_final,
        tipo=pago_in.tipo,
        referencia_id=pago_in.referencia_id,
        monto=pago_in.monto,
        metodo_pago=pago_in.metodo_pago,
        numero_transaccion=pago_in.numero_transaccion,
        registrado_por=current_user.id, # Asignación automática
        fecha_pago=datetime.utcnow(),
        estado_pago=EstadoPago.PENDIENTE
    )
    
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
    pago_data: PagoCreate, # Podrías crear un PagoUpdate opcional si prefieres
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
    
    # Actualizar solo los campos que vienen
    datos = pago_data.dict(exclude_unset=True)
    for key, value in datos.items():
        if hasattr(item, key):
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