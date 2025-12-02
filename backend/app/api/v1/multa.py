import json
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session, select

from app.api.deps import get_db
from app.models.alerta import Alerta, TipoAlerta
from app.models.gasto_comun import GastoComun, EstadoGastoComun
from app.models.multa import Multa, TipoMulta, EstadoMulta
from app.models.registro import RegistroModel, TipoEvento
from app.models.residente import Residente
from app.models.usuario import Usuario
from app.utils.email_service import send_email

router = APIRouter(prefix="/multas", tags=["Multas"])


class AjusteMulta(BaseModel):
    nuevo_monto: Decimal
    motivo: str
    es_condonacion: bool = False
    usuario_id: int


class ReversionMulta(BaseModel):
    registro_id: int
    motivo: str
    usuario_id: int


@router.get("", response_model=List[Multa])
async def listar_multas(
    residente_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    query = select(Multa)
    if residente_id:
        query = query.where(Multa.residente_id == residente_id)
    return db.exec(query).all()


@router.post("", response_model=Multa, status_code=status.HTTP_201_CREATED)
async def crear_multa(data: Multa, db: Session = Depends(get_db)):
    if not data.estado:
        data.estado = EstadoMulta.PENDIENTE

    db.add(data)

    alerta = Alerta(
        titulo="Nueva Multa Cursada (Manual)",
        descripcion=(
            f"Se ha cursado una multa manual de ${data.monto} al residente ID "
            f"{data.residente_id}. Motivo: {data.descripcion}"
        ),
        tipo=TipoAlerta.MULTA,
        condominio_id=data.condominio_id,
    )
    db.add(alerta)

    db.commit()
    db.refresh(data)

    residente = db.get(Residente, data.residente_id)
    if residente and residente.suscrito_notificaciones and residente.activo and residente.email:
        enviado = send_email(
            [residente.email],
            f"[Casitas Teto] Nueva multa: {data.tipo}",
            (
                f"Hola {residente.nombre},\n\n"
                f"Se ha registrado una multa en tu cuenta.\n"
                f"Tipo: {data.tipo}\n"
                f"Motivo: {data.descripcion}\n"
                f"Monto: {data.monto}\n"
                f"Fecha de emisión: {data.fecha_emision}\n\n"
                "Si no deseas recibir estas notificaciones, desactiva las notificaciones de correo en tu perfil.\n"
            ),
        )
        if enviado:
            residente.ultimo_correo_enviado = datetime.utcnow()
            db.add(residente)
            db.commit()
            db.refresh(residente)

    return data


@router.post("/procesar-atrasos", status_code=status.HTTP_200_OK)
async def procesar_atrasos(
    admin_id: int,
    db: Session = Depends(get_db),
):
    today = date.today()

    gastos_vencidos = db.exec(
        select(GastoComun).where(
            GastoComun.fecha_vencimiento < today,
            GastoComun.estado == EstadoGastoComun.PENDIENTE,
        )
    ).all()

    multas_creadas = 0

    for gc in gastos_vencidos:
        gc.estado = EstadoGastoComun.VENCIDO
        db.add(gc)

        descripcion_multa = f"Multa automática por atraso Gasto Común {gc.mes}/{gc.anio}"

        existe_multa = db.exec(
            select(Multa).where(
                Multa.residente_id == gc.residente_id,
                Multa.descripcion == descripcion_multa,
                Multa.tipo == TipoMulta.RETRASO_PAGO,
            )
        ).first()

        if existe_multa:
            continue

        monto_multa = Decimal("5000.00")
        nueva_multa = Multa(
            residente_id=gc.residente_id,
            condominio_id=gc.condominio_id,
            tipo=TipoMulta.RETRASO_PAGO,
            descripcion=descripcion_multa,
            monto=monto_multa,
            estado=EstadoMulta.PENDIENTE,
            fecha_emision=today,
            creado_por=admin_id,
        )
        db.add(nueva_multa)

        alerta_morosidad = Alerta(
            titulo="Morosidad Detectada",
            descripcion=(
                f"El residente ID {gc.residente_id} ha pasado a morosidad por "
                f"Gasto Común {gc.mes}/{gc.anio}. Se generó multa automática."
            ),
            tipo=TipoAlerta.MOROSIDAD,
            condominio_id=gc.condominio_id,
        )
        db.add(alerta_morosidad)

        residente = db.get(Residente, gc.residente_id)
        if residente and residente.suscrito_notificaciones and residente.activo and residente.email:
            enviado = send_email(
                [residente.email],
                f"[Casitas Teto] Multa automática: {nueva_multa.descripcion}",
                (
                    f"Hola {residente.nombre},\n\n"
                    f"Se ha generado una multa automática por morosidad del gasto común {gc.mes}/{gc.anio}.\n"
                    f"Monto: {nueva_multa.monto}\n"
                    f"Fecha de emisión: {nueva_multa.fecha_emision}\n\n"
                    "Si no deseas recibir estas notificaciones, desactiva las notificaciones de correo en tu perfil.\n"
                ),
            )
            if enviado:
                residente.ultimo_correo_enviado = datetime.utcnow()
                db.add(residente)

        multas_creadas += 1

    db.commit()

    return {
        "message": "Proceso completado",
        "gastos_vencidos_detectados": len(gastos_vencidos),
        "multas_creadas": multas_creadas,
    }


@router.post("/{multa_id}/ajustar", response_model=Multa)
async def ajustar_multa(multa_id: int, data: AjusteMulta, db: Session = Depends(get_db)):
    multa = db.get(Multa, multa_id)
    if not multa:
        raise HTTPException(status_code=404, detail="Multa no encontrada")

    monto_original = float(multa.monto)
    multa.monto = data.nuevo_monto
    db.add(multa)
    db.commit()
    db.refresh(multa)

    registro = RegistroModel(
        usuario_id=data.usuario_id,
        tipo_evento=TipoEvento.EDICION,
        detalle=f"Ajuste multa ID {multa_id}: {monto_original} -> {float(data.nuevo_monto)}",
        monto=float(data.nuevo_monto),
        condominio_id=multa.condominio_id,
        datos_adicionales=json.dumps(
            {
                "tipo_objeto": "MULTA",
                "multa_id": multa_id,
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

    return multa


@router.post("/{multa_id}/revertir", response_model=Multa)
async def revertir_multa(multa_id: int, data: ReversionMulta, db: Session = Depends(get_db)):
    multa = db.get(Multa, multa_id)
    if not multa:
        raise HTTPException(status_code=404, detail="Multa no encontrada")

    registro = db.get(RegistroModel, data.registro_id)
    if not registro:
        raise HTTPException(status_code=404, detail="Registro no encontrado")

    try:
        meta = json.loads(registro.datos_adicionales or "{}")
    except json.JSONDecodeError:
        meta = {}

    if meta.get("tipo_objeto") != "MULTA" or meta.get("multa_id") != multa_id:
        raise HTTPException(status_code=400, detail="El registro no corresponde a esta multa")

    monto_original = meta.get("monto_original")
    if monto_original is None:
        raise HTTPException(status_code=400, detail="El registro no contiene monto original para revertir")

    multa.monto = Decimal(str(monto_original))
    db.add(multa)
    db.commit()
    db.refresh(multa)

    registro_reversion = RegistroModel(
        usuario_id=data.usuario_id,
        tipo_evento=TipoEvento.EDICION,
        detalle=f"Reversion ajuste multa ID {multa_id}: restaura a {monto_original}",
        monto=float(multa.monto),
        condominio_id=multa.condominio_id,
        datos_adicionales=json.dumps(
            {
                "tipo_objeto": "MULTA",
                "multa_id": multa_id,
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

    return multa


@router.get("/{item_id}", response_model=Multa)
async def obtener_multa(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Multa, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Multa no encontrada")
    return item


@router.put("/{item_id}", response_model=Multa)
async def actualizar_multa(item_id: int, data: Multa, db: Session = Depends(get_db)):
    item = db.get(Multa, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Multa no encontrada")

    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)

    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_multa(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Multa, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Multa no encontrada")

    db.delete(item)
    db.commit()
    return None
