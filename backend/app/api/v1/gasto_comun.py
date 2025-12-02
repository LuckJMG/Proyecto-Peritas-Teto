import json
from datetime import datetime
from decimal import Decimal
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.api.deps import get_db
from app.models.alerta import Alerta, TipoAlerta
from app.models.gasto_comun import GastoComun
from app.models.registro import RegistroModel, TipoEvento
from app.models.residente import Residente
from app.schemas.gasto_comun import GastoComunInput
from app.utils.email_service import send_email

router = APIRouter(prefix="/gastos-comunes", tags=["Gastos Comunes"])


class AjusteMonto(BaseModel):
    nuevo_monto: Decimal
    motivo: str
    es_condonacion: bool = False
    usuario_id: int


class ReversionAjuste(BaseModel):
    registro_id: int
    motivo: str
    usuario_id: int


@router.get("", response_model=List[GastoComun])
async def listar(db: Session = Depends(get_db)):
    gastos = db.exec(select(GastoComun)).all()
    return gastos


@router.get("/{gasto_id}", response_model=GastoComun)
async def obtener(gasto_id: int, db: Session = Depends(get_db)):
    gasto = db.get(GastoComun, gasto_id)
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto comun no encontrado")
    return gasto


@router.post("", response_model=GastoComun, status_code=status.HTTP_201_CREATED)
async def crear(data: GastoComunInput, db: Session = Depends(get_db)):
    gasto = GastoComun(**data.dict())
    db.add(gasto)
    db.commit()
    db.refresh(gasto)

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


@router.put("/{gasto_id}", response_model=GastoComun)
async def actualizar(gasto_id: int, data: GastoComunInput, db: Session = Depends(get_db)):
    gasto = db.get(GastoComun, gasto_id)
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto comun no encontrado")

    for key, value in data.dict(exclude_unset=True).items():
        setattr(gasto, key, value)

    db.add(gasto)

    alerta_edicion = Alerta(
        titulo="Edicion de Gasto Comun",
        descripcion=f"El Gasto Comun ID {gasto_id} ({gasto.mes}/{gasto.anio}) ha sido modificado.",
        tipo=TipoAlerta.EDICION_GASTO,
        condominio_id=gasto.condominio_id,
    )
    db.add(alerta_edicion)

    db.commit()
    db.refresh(gasto)
    return gasto


@router.post("/{gasto_id}/ajustar", response_model=GastoComun)
async def ajustar_monto(gasto_id: int, data: AjusteMonto, db: Session = Depends(get_db)):
    gasto = db.get(GastoComun, gasto_id)
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto comun no encontrado")

    monto_original = float(gasto.monto_total)
    gasto.monto_total = data.nuevo_monto
    db.add(gasto)
    db.commit()
    db.refresh(gasto)

    registro = RegistroModel(
        usuario_id=data.usuario_id,
        tipo_evento=TipoEvento.EDICION,
        detalle=f"Ajuste gasto comun ID {gasto_id}: {monto_original} -> {float(data.nuevo_monto)}",
        monto=float(data.nuevo_monto),
        condominio_id=gasto.condominio_id,
        datos_adicionales=json.dumps(
            {
                "tipo_objeto": "GASTO",
                "gasto_id": gasto_id,
                "monto_original": monto_original,
                "monto_editado": float(data.nuevo_monto),
                "accion": "CONDONACION" if data.es_condonacion else "EDICION",
                "motivo": data.motivo,
                "revertible": True,
                "timestamp": datetime.utcnow().isoformat(),
            }
        ),
    )
    db.add(registro)
    db.commit()

    return gasto


@router.post("/{gasto_id}/revertir", response_model=GastoComun)
async def revertir_ajuste(gasto_id: int, data: ReversionAjuste, db: Session = Depends(get_db)):
    gasto = db.get(GastoComun, gasto_id)
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto comun no encontrado")

    registro = db.get(RegistroModel, data.registro_id)
    if not registro:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    try:
        meta = json.loads(registro.datos_adicionales or "{}")
    except json.JSONDecodeError:
        meta = {}

    if meta.get("tipo_objeto") != "GASTO" or meta.get("gasto_id") != gasto_id:
        raise HTTPException(status_code=400, detail="El registro no corresponde a este gasto")

    monto_original = meta.get("monto_original")
    if monto_original is None:
        raise HTTPException(status_code=400, detail="El registro no contiene monto original para revertir")

    gasto.monto_total = Decimal(str(monto_original))
    db.add(gasto)
    db.commit()
    db.refresh(gasto)

    registro_reversion = RegistroModel(
        usuario_id=data.usuario_id,
        tipo_evento=TipoEvento.EDICION,
        detalle=f"Reversion ajuste gasto comun ID {gasto_id}: restaura a {monto_original}",
        monto=float(gasto.monto_total),
        condominio_id=gasto.condominio_id,
        datos_adicionales=json.dumps(
            {
                "tipo_objeto": "GASTO",
                "gasto_id": gasto_id,
                "accion": "REVERSION",
                "registro_revertido": data.registro_id,
                "monto_restaurado": monto_original,
                "motivo": data.motivo,
                "timestamp": datetime.utcnow().isoformat(),
            }
        ),
    )
    db.add(registro_reversion)
    db.commit()

    return gasto


@router.delete("/{gasto_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar(gasto_id: int, db: Session = Depends(get_db)):
    gasto = db.get(GastoComun, gasto_id)
    if not gasto:
        raise HTTPException(status_code=404, detail="Gasto comun no encontrado")

    db.delete(gasto)
    db.commit()
    return None
