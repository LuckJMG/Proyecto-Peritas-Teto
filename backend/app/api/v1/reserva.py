from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from datetime import datetime, date, timedelta
from decimal import Decimal

# Dependencias y Modelos
from app.api.deps import get_db
from app.models.reserva import Reserva
from app.models.espacio_comun import EspacioComun
from app.models.gasto_comun import GastoComun, EstadoGastoComun
from app.schemas.reserva import ReservaCreate

router = APIRouter(prefix="/reservas", tags=["Reservas"])

def get_or_create_gasto_comun(
    db: Session, 
    residente_id: int, 
    fecha: date,
    condominio_id: int
) -> GastoComun:
    """
    Busca un Gasto Común para el mes/año dados. Si no existe, lo crea.
    """
    mes = fecha.month
    anio = fecha.year
    
    query = select(GastoComun).where(
        GastoComun.residente_id == residente_id,
        GastoComun.mes == mes,
        GastoComun.anio == anio
    )
    gasto = db.exec(query).first()
    
    if not gasto:
        # Crear nuevo gasto común si no existe
        # Fecha de vencimiento por defecto: día 5 del mes siguiente
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
            fecha_vencimiento=fecha_vencimiento
        )
        db.add(gasto)
        db.commit()
        db.refresh(gasto)
        
    return gasto

def calcular_costo(hora_inicio, hora_fin, costo_por_hora: Decimal) -> Decimal:
    """Calcula el costo total basado en la duración y tarifa."""
    if not costo_por_hora:
        return Decimal(0)
    
    # Combinar con fecha dummy para poder restar
    dt_inicio = datetime.combine(date.min, hora_inicio)
    dt_fin = datetime.combine(date.min, hora_fin)
    
    # Si fin es menor que inicio, asumimos que cruza medianoche (opcional, aquí asumimos mismo día)
    if dt_fin < dt_inicio:
        dt_fin += timedelta(days=1)
        
    duracion_horas = Decimal((dt_fin - dt_inicio).total_seconds() / 3600)
    return round(duracion_horas * costo_por_hora, 2)

# GET /reservas - Listar todas
@router.get("", response_model=List[Reserva])
async def listar_reservas(db: Session = Depends(get_db)):
    items = db.exec(select(Reserva)).all()
    return items

# POST /reservas - Crear
@router.post("", response_model=Reserva, status_code=status.HTTP_201_CREATED)
async def crear_reserva(data: ReservaCreate, db: Session = Depends(get_db)):
    # 1. Validar Espacio Común
    espacio = db.get(EspacioComun, data.espacio_comun_id)
    if not espacio:
        raise HTTPException(status_code=404, detail="Espacio común no encontrado")

    # 2. Transformación de fechas
    fecha_reserva = data.fecha_inicio.date()
    hora_inicio = data.fecha_inicio.time()
    hora_fin = data.fecha_fin.time()

    # 3. Calcular Costo
    costo_total = calcular_costo(hora_inicio, hora_fin, espacio.costo_por_hora or Decimal(0))

    # 4. Manejo de observaciones
    obs_texto = f"Asistentes: {data.cantidad_personas}"
    if data.observaciones:
        obs_texto += f" | {data.observaciones}"

    # 5. Crear Reserva
    nueva_reserva = Reserva(
        residente_id=data.residente_id,
        espacio_comun_id=data.espacio_comun_id,
        fecha_reserva=fecha_reserva,
        hora_inicio=hora_inicio,
        hora_fin=hora_fin,
        observaciones=obs_texto,
        monto_pago=costo_total,
        estado="CONFIRMADA" # Asumimos confirmada al crear por ahora
    )
    
    db.add(nueva_reserva)
    db.commit()
    db.refresh(nueva_reserva)

    # 6. Actualizar Gasto Común (Si hay costo)
    if costo_total > 0:
        gasto = get_or_create_gasto_comun(
            db, 
            data.residente_id, 
            fecha_reserva, 
            espacio.condominio_id
        )
        
        # Verificar si el gasto ya está pagado (Regla de negocio: no sumar a gastos cerrados)
        if gasto.estado == EstadoGastoComun.PAGADO:
            # Opción A: Error. Opción B: Crear gasto mes siguiente.
            # Aquí optamos por advertir o sumar igual reabriendo deuda (depende de regla de negocio).
            # Por simplicidad para MVP: Sumamos y cambiamos estado a MOROSO/PENDIENTE si estaba pagado.
            gasto.estado = EstadoGastoComun.PENDIENTE
        
        gasto.servicios += costo_total
        gasto.monto_total += costo_total
        
        # Agregar observación al gasto
        obs_gasto = {
            "fecha": str(date.today()),
            "tipo": "RESERVA",
            "descripcion": f"Reserva {espacio.nombre} ({fecha_reserva})",
            "monto": float(costo_total)
        }
        # Asegurar que observaciones es una lista
        current_obs = list(gasto.observaciones) if gasto.observaciones else []
        current_obs.append(obs_gasto)
        gasto.observaciones = current_obs # type: ignore
        
        db.add(gasto)
        db.commit()
    
    return nueva_reserva

# GET /reservas/{item_id} - Obtener una
@router.get("/{item_id}", response_model=Reserva)
async def obtener_reserva(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Reserva, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    return item

# PUT /reservas/{item_id} - Actualizar
@router.put("/{item_id}", response_model=Reserva)
async def actualizar_reserva(item_id: int, data: Reserva, db: Session = Depends(get_db)):
    # Nota: Actualizar una reserva con costo implicaría recalcular diferencias en el gasto común.
    # Esta implementación básica solo actualiza datos directos.
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

# DELETE /reservas/{item_id} - Eliminar
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_reserva(item_id: int, db: Session = Depends(get_db)):
    item = db.get(Reserva, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Reserva no encontrada")
    
    # Revertir cobro en Gasto Común si aplica
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
                    status_code=400, 
                    detail="No se puede cancelar una reserva cuyo gasto común asociado ya ha sido pagado."
                )
            
            # Restar montos
            gasto.servicios -= item.monto_pago
            gasto.monto_total -= item.monto_pago
            
            # Evitar negativos por errores de redondeo
            if gasto.servicios < 0: gasto.servicios = Decimal(0)
            if gasto.monto_total < 0: gasto.monto_total = Decimal(0)
            
            # Registrar reversa en observaciones
            obs_reversa = {
                "fecha": str(date.today()),
                "tipo": "CANCELACION_RESERVA",
                "descripcion": f"Cancelación Reserva ID {item.id}",
                "monto": -float(item.monto_pago)
            }
            current_obs = list(gasto.observaciones) if gasto.observaciones else []
            current_obs.append(obs_reversa)
            gasto.observaciones = current_obs # type: ignore
            
            db.add(gasto)

    db.delete(item)
    db.commit()
    return None
