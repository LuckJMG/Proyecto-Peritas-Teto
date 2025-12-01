from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.api.deps import get_db
from app.models.gasto_comun import GastoComun
from app.schemas.gasto_comun import GastoComunInput
from app.models.alerta import Alerta, TipoAlerta

router = APIRouter(prefix="/gastos-comunes", tags=["Gastos Comunes"])

# GET /gastos-comunes - Listar todos
@router.get("", response_model=List[GastoComun])
async def listar(db: Session = Depends(get_db)):
    gastos = db.exec(select(GastoComun)).all()
    return gastos


# GET /gastos-comunes/{id} - Obtener uno
@router.get("/{gasto_id}", response_model=GastoComun)
async def obtener(gasto_id: int, db: Session = Depends(get_db)):
    gasto = db.get(GastoComun, gasto_id)
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto común no encontrado")
    return gasto


# POST /gastos-comunes - Crear
@router.post("", response_model=GastoComun, status_code=status.HTTP_201_CREATED)
async def crear(data: GastoComunInput, db: Session = Depends(get_db)):
    gasto = GastoComun(**data.dict())
    db.add(gasto)
    db.commit()
    db.refresh(gasto)
    return gasto


# PUT /gastos-comunes/{id} - Actualizar
@router.put("/{gasto_id}", response_model=GastoComun)
async def actualizar(gasto_id: int, data: GastoComunInput, db: Session = Depends(get_db)):
    gasto = db.get(GastoComun, gasto_id)
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto común no encontrado")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(gasto, key, value)
    
    db.add(gasto)
    
    # --- TRIGGER ALERTA: EDICIÓN DE GASTO ---
    alerta_edicion = Alerta(
        titulo="Edición de Gasto Común",
        descripcion=f"El Gasto Común ID {gasto_id} ({gasto.mes}/{gasto.anio}) ha sido modificado.",
        tipo=TipoAlerta.EDICION_GASTO,
        condominio_id=gasto.condominio_id
    )
    db.add(alerta_edicion)
    # ----------------------------------------

    db.commit()
    db.refresh(gasto)
    return gasto


# DELETE /gastos-comunes/{id} - Eliminar
@router.delete("/{gasto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar(gasto_id: int, db: Session = Depends(get_db)):
    gasto = db.get(GastoComun, gasto_id)
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto común no encontrado")
    
    db.delete(gasto)
    db.commit()
    return None