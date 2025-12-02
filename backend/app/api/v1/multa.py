from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal

from app.api.deps import get_db
from app.models.multa import Multa, TipoMulta, EstadoMulta
from app.models.gasto_comun import GastoComun, EstadoGastoComun
from app.models.usuario import Usuario
from app.models.alerta import Alerta, TipoAlerta, EstadoAlerta
from app.models.residente import Residente
from app.utils.email_service import send_email

router = APIRouter(prefix="/multas", tags=["Multas"])


@router.get("", response_model=List[Multa])
async def listar_multas(
    residente_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    """Listar multas, opcionalmente filtrando por residente."""
    query = select(Multa)
    if residente_id:
        query = query.where(Multa.residente_id == residente_id)
    return db.exec(query).all()


@router.post("", response_model=Multa, status_code=status.HTTP_201_CREATED)
async def crear_multa(data: Multa, db: Session = Depends(get_db)):
    """Crear multa manual y notificar por correo al residente suscrito."""
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
    """Detecta gastos vencidos, genera multas automáticas y notifica."""
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


@router.get("/{item_id}", response_model=Multa)
async def obtener_multa(item_id: int, db: Session = Depends(get_db)):
    """Obtener una multa específica."""
    item = db.get(Multa, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Multa no encontrada")
    return item


@router.put("/{item_id}", response_model=Multa)
async def actualizar_multa(item_id: int, data: Multa, db: Session = Depends(get_db)):
    """Actualizar una multa existente."""
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
    """Eliminar una multa."""
    item = db.get(Multa, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Multa no encontrada")

    db.delete(item)
    db.commit()
    return None
