from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime
from app.api.deps import get_db
from app.models.alerta import Alerta, EstadoAlerta

router = APIRouter(prefix="/alertas", tags=["Alertas"])

@router.get("", response_model=List[Alerta])
async def listar_alertas(
    estado: Optional[EstadoAlerta] = None,
    db: Session = Depends(get_db)
):
    """
    Lista las alertas, ordenadas por fecha de creación descendente.
    """
    query = select(Alerta)
    if estado:
        query = query.where(Alerta.estado == estado)
    
    # Ordenar: Más recientes primero
    query = query.order_by(Alerta.fecha_creacion.desc())
    
    return db.exec(query).all()

@router.put("/{alerta_id}/resolver", response_model=Alerta)
async def resolver_alerta(
    alerta_id: int, 
    comentario: str, 
    db: Session = Depends(get_db)
):
    """
    Marca una alerta como resuelta y agrega un comentario.
    """
    alerta = db.get(Alerta, alerta_id)
    if not alerta:
        raise HTTPException(status_code=404, detail="Alerta no encontrada")
    
    alerta.estado = EstadoAlerta.RESUELTO
    alerta.comentario_resolucion = comentario
    alerta.fecha_resolucion = datetime.now()
    # alerta.resuelto_por = current_user.id # Si tuvieras el usuario en sesión
    
    db.add(alerta)
    db.commit()
    db.refresh(alerta)
    return alerta