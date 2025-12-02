from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.api.deps import get_db
from app.models.gasto_comun import GastoComun
from app.schemas.gasto_comun import GastoComunInput
from app.models.alerta import Alerta, TipoAlerta
from app.models.residente import Residente
from app.utils.email_service import send_email

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
        raise HTTPException(status_code=404, detail="Gasto comun no encontrado")
    return gasto


# POST /gastos-comunes - Crear
@router.post("", response_model=GastoComun, status_code=status.HTTP_201_CREATED)
async def crear(data: GastoComunInput, db: Session = Depends(get_db)):
    gasto = GastoComun(**data.dict())
    db.add(gasto)
    db.commit()
    db.refresh(gasto)

    # Notificar al residente si esta suscrito
    residente = db.get(Residente, gasto.residente_id)
    if residente and residente.suscrito_notificaciones and residente.activo and residente.email:
        enviado = send_email(
            [residente.email],
            f"[Casitas Teto] Gasto comun {gasto.mes}/{gasto.anio}",
            (
                f"Hola {residente.nombre},\n\n"
                f"Se ha generado tu gasto comun del mes {gasto.mes}/{gasto.anio}.\n"
                f"Monto total: {gasto.monto_total}\n"
                f"Fecha de vencimiento: {gasto.fecha_vencimiento}\n\n"
                f"Detalle: cuota mantencion {gasto.cuota_mantencion}, servicios {gasto.servicios}, multas {gasto.multas}.\n\n"
                "Si no deseas recibir estas notificaciones, desactiva las notificaciones de correo en tu perfil.\n"
            )
        )
        if enviado:
            residente.ultimo_correo_enviado = datetime.utcnow()
            db.add(residente)
            db.commit()
            db.refresh(residente)

    return gasto


# PUT /gastos-comunes/{id} - Actualizar
@router.put("/{gasto_id}", response_model=GastoComun)
async def actualizar(gasto_id: int, data: GastoComunInput, db: Session = Depends(get_db)):
    gasto = db.get(GastoComun, gasto_id)
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto comun no encontrado")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(gasto, key, value)
    
    db.add(gasto)
    
    # --- TRIGGER ALERTA: EDICION DE GASTO ---
    alerta_edicion = Alerta(
        titulo="Edicion de Gasto Comun",
        descripcion=f"El Gasto Comun ID {gasto_id} ({gasto.mes}/{gasto.anio}) ha sido modificado.",
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
        raise HTTPException(status_code=404, detail="Gasto comun no encontrado")
    
    db.delete(gasto)
    db.commit()
    return None
