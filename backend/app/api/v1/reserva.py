from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, text
from sqlalchemy.exc import IntegrityError
from typing import List
from datetime import datetime, date, timedelta
from decimal import Decimal

from app.api.deps import get_db
from app.models.reserva import Reserva, EstadoReserva
from app.models.espacio_comun import EspacioComun
from app.models.gasto_comun import GastoComun, EstadoGastoComun
from app.models.usuario import Usuario, RolUsuario
from app.models.residente import Residente
from app.schemas.reserva import ReservaCreate
from app.core.security import get_current_user
from app.utils.email_service import send_email

router = APIRouter(prefix="/reservas", tags=["Reservas"])

def get_or_create_admin_residente(db: Session, user: Usuario) -> Residente:
    """
    Busca si el usuario admin ya tiene un perfil de residente asociado.
    Si no, crea uno 'dummy' para permitirle hacer reservas.
    Incluye lógica de auto-reparación para secuencias desincronizadas.
    """
    if not user.condominio_id:
        raise HTTPException(status_code=400, detail="El administrador no tiene condominio asignado")

    query = select(Residente).where(Residente.usuario_id == user.id)
    residente = db.exec(query).first()
    
    if residente:
        return residente

    rut_ficticio = f"ADMIN-{user.id}"
    
    nuevo_residente = Residente(
        usuario_id=user.id,
        condominio_id=user.condominio_id,
        vivienda_numero="OFICINA",
        nombre=user.nombre,
        apellido=user.apellido,
        rut=rut_ficticio,
        email=user.email,
        telefono=None,
        es_propietario=False,
        activo=True
    )
    
    try:
        db.add(nuevo_residente)
        db.commit()
        db.refresh(nuevo_residente)
        return nuevo_residente
    except IntegrityError as e:
        db.rollback()
        if "residentes_pkey" in str(e):
            try:
                sync_sql = text("SELECT setval(pg_get_serial_sequence('residentes', 'id'), coalesce(max(id), 0) + 1, false) FROM residentes")
                db.exec(sync_sql)
                db.commit()
                db.add(nuevo_residente)
                db.commit()
                db.refresh(nuevo_residente)
                return nuevo_residente
            except Exception as retry_error:
                print(f"Fallo en auto-reparación: {retry_error}")
        existing = db.exec(select(Residente).where(Residente.rut == rut_ficticio)).first()
        if existing:
            return existing
        raise HTTPException(status_code=500, detail=f"Error de integridad al crear perfil admin: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error inesperado creando perfil admin: {str(e)}")

def get_or_create_gasto_comun(db: Session, residente_id: int, fecha: date, condominio_id: int) -> GastoComun:
    mes = fecha.month
    anio = fecha.year
    query = select(GastoComun).where(
        GastoComun.residente_id == residente_id,
        GastoComun.mes == mes,
        GastoComun.anio == anio
    )
    gasto = db.exec(query).first()
    
    if not gasto:
        if mes == 12:
            next_mes = 1
            next_anio = anio + 1
        else:
            next_mes = mes + 1
            next_anio = anio
        fecha_vencimiento = date(next_anio, next_mes, 5)
        gasto = GastoComun(
            residente_id=residente_id,
            condominio_id=condominio_id,
            mes=mes,
            anio=anio,
            monto_base=0,
            cuota_mantencion=0,
            servicios=0,
            multas=0,
            monto_total=0,
            estado=EstadoGastoComun.PENDIENTE,
            fecha_emision=date.today(),
            fecha_vencimiento=fecha_vencimiento,
            observaciones=[]
        )
        db.add(gasto)
        db.commit()
        db.refresh(gasto)
    return gasto

def calcular_costo_reserva(hora_inicio, hora_fin, costo_por_hora: Decimal) -> Decimal:
    if not costo_por_hora or costo_por_hora == 0:
        return Decimal(0)
    dt_inicio = datetime.combine(date.min, hora_inicio)
    dt_fin = datetime.combine(date.min, hora_fin)
    if dt_fin < dt_inicio:
        dt_fin += timedelta(days=1)
    duracion_segundos = (dt_fin - dt_inicio).total_seconds()
    duracion_horas = Decimal(duracion_segundos / 3600)
    total = duracion_horas * costo_por_hora
    return round(total, 2)

@router.get("", response_model=List[Reserva])
async def listar_reservas(db: Session = Depends(get_db)):
    items = db.exec(select(Reserva)).all()
    return items

@router.post("", response_model=Reserva, status_code=status.HTTP_201_CREATED)
async def crear_reserva(
    data: ReservaCreate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_user)
):
    espacio = db.get(EspacioComun, data.espacio_comun_id)
    if not espacio:
        raise HTTPException(status_code=404, detail="Espacio común no encontrado")

    residente_id = data.residente_id
    es_admin = current_user.rol in [RolUsuario.ADMINISTRADOR, RolUsuario.SUPER_ADMINISTRADOR]

    if not residente_id:
        if es_admin:
            residente_admin = get_or_create_admin_residente(db, current_user)
            residente_id = residente_admin.id
        else:
            raise HTTPException(status_code=400, detail="Debe especificar un residente_id")

    fecha_reserva = data.fecha_inicio.date()
    hora_inicio = data.fecha_inicio.time()
    hora_fin = data.fecha_fin.time()

    costo_total = Decimal(0)
    estado_inicial = EstadoReserva.PENDIENTE_PAGO
    
    if data.es_evento_comunidad and es_admin:
        costo_total = Decimal(0)
        estado_inicial = EstadoReserva.CONFIRMADA
    else:
        costo_total = calcular_costo_reserva(
            hora_inicio, 
            hora_fin, 
            espacio.costo_por_hora or Decimal(0)
        )

    obs_texto = f"Asistentes: {data.cantidad_personas}"
    if data.es_evento_comunidad:
        obs_texto += " | EVENTO COMUNIDAD (Sin Costo)"
    if data.observaciones:
        obs_texto += f" | {data.observaciones}"

    nueva_reserva = Reserva(
        residente_id=residente_id,
        espacio_comun_id=data.espacio_comun_id,
        fecha_reserva=fecha_reserva,
        hora_inicio=hora_inicio,
        hora_fin=hora_fin,
        observaciones=obs_texto,
        monto_pago=costo_total,
        estado=estado_inicial
    )
    
    db.add(nueva_reserva)
    db.commit()
    db.refresh(nueva_reserva)

    # Notificar al residente si está suscrito y activo
    residente = db.get(Residente, residente_id)
    if residente and residente.suscrito_notificaciones and residente.activo and residente.email:
        enviado = send_email(
            [residente.email],
            f"[Casitas Teto] Reserva {'confirmada' if estado_inicial == EstadoReserva.CONFIRMADA else 'creada'}: {espacio.nombre}",
            (
                f"Hola {residente.nombre},\n\n"
                f"Tu reserva de {espacio.nombre} ha sido {'confirmada' if estado_inicial == EstadoReserva.CONFIRMADA else 'creada'}.\n"
                f"Fecha: {fecha_reserva}\n"
                f"Horario: {hora_inicio} a {hora_fin}\n"
                f"Estado: {estado_inicial}\n"
                f"Monto a pagar: {costo_total}\n\n"
                "Si no deseas recibir estas notificaciones, desactiva las notificaciones de correo en tu perfil.\n"
            )
        )
        if enviado:
            residente.ultimo_correo_enviado = datetime.utcnow()
            db.add(residente)
            db.commit()
            db.refresh(residente)

    # Gasto Común (Solo si NO es evento comunidad y hay costo)
    if costo_total > 0 and not (data.es_evento_comunidad and es_admin):
        gasto = get_or_create_gasto_comun(
            db, 
            residente_id, 
            fecha_reserva, 
            espacio.condominio_id
        )
        
        if gasto.estado == EstadoGastoComun.PAGADO:
            gasto.estado = EstadoGastoComun.PENDIENTE
        
        gasto.servicios += costo_total
        gasto.monto_total += costo_total
        
        nuevas_obs = list(gasto.observaciones) if gasto.observaciones else []
        nuevas_obs.append({
            "fecha": str(date.today()),
            "tipo": "RESERVA",
            "descripcion": f"Reserva {espacio.nombre} ({fecha_reserva})",
            "monto": float(costo_total),
            "reserva_id": nueva_reserva.id
        })
        gasto.observaciones = nuevas_obs
        
        db.add(gasto)
        db.commit()
    
    return nueva_reserva

@router.get("/{item_id}", response_model=Reserva)
async def obtener_reserva(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Reserva, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return item

@router.put("/{item_id}", response_model=Reserva)
async def actualizar_reserva(item_id: int, data: Reserva, db: Session = Depends(get_db)):
    item = db.get(Reserva, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_reserva(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Reserva, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    if item.monto_pago and item.monto_pago > 0:
        mes = item.fecha_reserva.month
        anio = item.fecha_reserva.year
        
        query = select(GastoComun).where(
            GastoComun.residente_id == item.residente_id,
            GastoComun.mes == mes,
            GastoComun.anio == anio
        )
        gasto = db.exec(query).first()
        
        if gasto:
            if gasto.estado == EstadoGastoComun.PAGADO:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No se puede eliminar una reserva pagada."
                )
            
            gasto.servicios -= item.monto_pago
            gasto.monto_total -= item.monto_pago
            
            if gasto.servicios < 0: gasto.servicios = Decimal(0)
            if gasto.monto_total < 0: gasto.monto_total = Decimal(0)
            
            nuevas_obs = list(gasto.observaciones) if gasto.observaciones else []
            nuevas_obs.append({
                "fecha": str(date.today()),
                "tipo": "ANULACION_RESERVA",
                "descripcion": f"Cancelación Reserva ID {item.id}",
                "monto": -float(item.monto_pago)
            })
            gasto.observaciones = nuevas_obs
            
            db.add(gasto)

    db.delete(item)
    db.commit()
    return None
