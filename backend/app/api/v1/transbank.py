# backend/app/api/v1/transbank.py
"""
Endpoints específicos para integración con Transbank Webpay Plus
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, and_
from transbank.webpay.webpay_plus.transaction import Transaction
from transbank.common.integration_type import IntegrationType
from transbank.common.options import WebpayOptions
from typing import List
from datetime import datetime
from pydantic import BaseModel
from decimal import Decimal

from app.api.deps import get_db
from app.models.pago import Pago, EstadoPago, MetodoPago, TipoPago
from app.models.residente import Residente
from app.models.gasto_comun import GastoComun
from app.models.multa import Multa, EstadoMulta
from app.models.reserva import Reserva, EstadoReserva

router = APIRouter(prefix="/transbank", tags=["Transbank"])

# Configuración Transbank - Ambiente de Integración (Sandbox)
TRANSBANK_COMMERCE_CODE = "597055555532"
TRANSBANK_API_KEY = "579B532A7440BB0C9079DED94D31EA1615BACEB56610332264630D42D0A36B1C"

webpay_options = WebpayOptions(
    TRANSBANK_COMMERCE_CODE, 
    TRANSBANK_API_KEY, 
    IntegrationType.TEST
)

# ============================================================================
# SCHEMAS / MODELS PARA REQUEST/RESPONSE
# ============================================================================

class PagoDetalle(BaseModel):
    id: int
    concepto: str
    monto: float
    tipo: str
    fecha: str

class ResidenteInfo(BaseModel):
    id: int
    nombre: str
    email: str
    vivienda: str

class PagosPendientesResponse(BaseModel):
    pagos: List[PagoDetalle]
    total: float
    residente: ResidenteInfo

class IniciarPagoRequest(BaseModel):
    residente_id: int
    pagos_ids: List[int]
    email: str
    return_url: str

class IniciarPagoResponse(BaseModel):
    token: str
    url: str
    buy_order: str
    monto: float

class ConfirmarPagoResponse(BaseModel):
    success: bool
    estado: str
    numero_transaccion: str
    monto: int
    fecha: str
    codigo_autorizacion: str = None
    tipo_pago: str = None
    mensaje: str
    response_code: int = None


# ============================================================================
# ENDPOINTS
# ============================================================================

@router.get("/pagos-pendientes/{residente_id}", response_model=PagosPendientesResponse)
async def obtener_pagos_pendientes(
    residente_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtiene todos los pagos pendientes de un residente.
    Sincroniza Multas y Reservas pendientes generando sus registros de Pago si no existen.
    """
    # Verificar que el residente existe
    residente = db.get(Residente, residente_id)
    if not residente:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Residente no encontrado"
        )
    
    # Determinar quién registra el pago automático (el usuario del residente o un fallback)
    # Si el residente no tiene usuario_id (raro), usamos 1 (admin por defecto) para evitar crash
    id_registrador = residente.usuario_id if residente.usuario_id else 1

    # -------------------------------------------------------------------------
    # 1. SINCRONIZACIÓN: Generar Pagos para Multas Pendientes
    # -------------------------------------------------------------------------
    try:
        multas_pendientes = db.exec(
            select(Multa).where(
                and_(
                    Multa.residente_id == residente_id,
                    Multa.estado == EstadoMulta.PENDIENTE
                )
            )
        ).all()

        for multa in multas_pendientes:
            # Verificar si ya existe el registro en la tabla pagos
            existe_pago = db.exec(
                select(Pago).where(
                    and_(
                        Pago.tipo == TipoPago.MULTA,
                        Pago.referencia_id == multa.id
                    )
                )
            ).first()

            if not existe_pago:
                nuevo_pago = Pago(
                    residente_id=residente_id,
                    condominio_id=multa.condominio_id,
                    tipo=TipoPago.MULTA,
                    referencia_id=multa.id,
                    monto=multa.monto,
                    metodo_pago=MetodoPago.WEBPAY, 
                    estado_pago=EstadoPago.PENDIENTE,
                    registrado_por=id_registrador # <--- FIX: Campo obligatorio añadido
                )
                db.add(nuevo_pago)

        # -------------------------------------------------------------------------
        # 2. SINCRONIZACIÓN: Generar Pagos para Reservas Pendientes
        # -------------------------------------------------------------------------
        reservas_pendientes = db.exec(
            select(Reserva).where(
                and_(
                    Reserva.residente_id == residente_id,
                    Reserva.estado == EstadoReserva.PENDIENTE_PAGO
                )
            )
        ).all()

        for reserva in reservas_pendientes:
            if reserva.monto_pago and reserva.monto_pago > 0:
                existe_pago = db.exec(
                    select(Pago).where(
                        and_(
                            Pago.tipo == TipoPago.RESERVA,
                            Pago.referencia_id == reserva.id
                        )
                    )
                ).first()

                if not existe_pago:
                    nuevo_pago = Pago(
                        residente_id=residente_id,
                        condominio_id=residente.condominio_id,
                        tipo=TipoPago.RESERVA,
                        referencia_id=reserva.id,
                        monto=reserva.monto_pago,
                        metodo_pago=MetodoPago.WEBPAY,
                        estado_pago=EstadoPago.PENDIENTE,
                        registrado_por=id_registrador # <--- FIX: Campo obligatorio añadido
                    )
                    db.add(nuevo_pago)

        # Guardar cambios de sincronización
        db.commit()
        
    except Exception as e:
        print(f"Error en sincronización automática de pagos: {e}")
        db.rollback()
        # No lanzamos error para permitir que se muestren los pagos que ya existían
        # aunque falle la sincronización de nuevos.

    # -------------------------------------------------------------------------
    # 3. OBTENCIÓN: Recuperar lista completa de pagos pendientes
    # -------------------------------------------------------------------------
    query = select(Pago).where(
        and_(
            Pago.residente_id == residente_id,
            Pago.estado_pago == EstadoPago.PENDIENTE
        )
    )
    pagos_pendientes = db.exec(query).all()
    
    # Formatear pagos con información adicional
    pagos_formateados = []
    total = Decimal(0)
    
    for pago in pagos_pendientes:
        concepto = _obtener_concepto_pago(pago, db)
        
        pagos_formateados.append(PagoDetalle(
            id=pago.id,
            concepto=concepto,
            monto=float(pago.monto),
            tipo=pago.tipo.value,
            fecha=pago.fecha_pago.isoformat()
        ))
        total += pago.monto
    
    return PagosPendientesResponse(
        pagos=pagos_formateados,
        total=float(total),
        residente=ResidenteInfo(
            id=residente.id,
            nombre=f"{residente.nombre} {residente.apellido}",
            email=residente.email,
            vivienda=residente.vivienda_numero
        )
    )


@router.post("/iniciar-pago", response_model=IniciarPagoResponse)
async def iniciar_pago_transbank(
    datos: IniciarPagoRequest,
    db: Session = Depends(get_db)
):
    try:
        # Verificar que existan los pagos y estén pendientes
        query = select(Pago).where(
            and_(
                Pago.id.in_(datos.pagos_ids),
                Pago.residente_id == datos.residente_id,
                Pago.estado_pago == EstadoPago.PENDIENTE
            )
        )
        pagos = db.exec(query).all()
        
        if len(pagos) != len(datos.pagos_ids):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Algunos pagos no existen o ya fueron procesados"
            )
        
        # Calcular monto total
        monto_total = sum(float(pago.monto) for pago in pagos)
        
        # Generar orden de compra única
        timestamp = int(datetime.now().timestamp())
        buy_order = f"ORD{datos.residente_id}{timestamp}"
        session_id = f"SES{datos.residente_id}{timestamp}"
        
        # Crear transacción en Transbank
        tx = Transaction(webpay_options)
        response = tx.create(
            buy_order=buy_order,
            session_id=session_id,
            amount=int(monto_total),
            return_url=datos.return_url
        )
        
        # Guardar información de la transacción en los pagos
        for pago in pagos:
            pago.numero_transaccion = buy_order
            pago.metodo_pago = MetodoPago.WEBPAY
        
        db.commit()
        
        return IniciarPagoResponse(
            token=response['token'],
            url=response['url'],
            buy_order=buy_order,
            monto=monto_total
        )
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error al iniciar pago con Transbank: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al iniciar el pago: {str(e)}"
        )


@router.post("/confirmar-pago", response_model=ConfirmarPagoResponse)
async def confirmar_pago_transbank(
    token_ws: str,
    db: Session = Depends(get_db)
):
    try:
        # Confirmar transacción con Transbank
        tx = Transaction(webpay_options)
        response = tx.commit(token=token_ws)
        
        # Verificar el estado de la transacción
        if response['status'] == 'AUTHORIZED' and response['response_code'] == 0:
            # PAGO APROBADO
            buy_order = response['buy_order']
            
            # Buscar pagos por número de orden
            query = select(Pago).where(Pago.numero_transaccion == buy_order)
            pagos = db.exec(query).all()
            
            if not pagos:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="No se encontraron pagos asociados a esta transacción"
                )
            
            # Actualizar estado de los pagos y sus referencias
            for pago in pagos:
                pago.estado_pago = EstadoPago.APROBADO
                pago.fecha_pago = datetime.now()
                
                # --- ACTUALIZAR ESTADO DE LA ENTIDAD RELACIONADA ---
                if pago.tipo == TipoPago.MULTA:
                    multa = db.get(Multa, pago.referencia_id)
                    if multa:
                        multa.estado = EstadoMulta.PAGADA
                        multa.fecha_pago = datetime.now()
                        db.add(multa)
                
                elif pago.tipo == TipoPago.RESERVA:
                    reserva = db.get(Reserva, pago.referencia_id)
                    if reserva:
                        reserva.estado = EstadoReserva.CONFIRMADA
                        db.add(reserva)
            
            db.commit()
            
            return ConfirmarPagoResponse(
                success=True,
                estado="APROBADO",
                numero_transaccion=response['buy_order'],
                monto=response['amount'],
                fecha=response['transaction_date'],
                codigo_autorizacion=response['authorization_code'],
                tipo_pago=response['payment_type_code'],
                mensaje="Pago procesado exitosamente"
            )
        else:
            # PAGO RECHAZADO
            buy_order = response.get('buy_order')
            
            if buy_order:
                query = select(Pago).where(Pago.numero_transaccion == buy_order)
                pagos = db.exec(query).all()
                
                for pago in pagos:
                    pago.estado_pago = EstadoPago.RECHAZADO
                
                db.commit()
            
            return ConfirmarPagoResponse(
                success=False,
                estado="RECHAZADO",
                numero_transaccion=buy_order or "N/A",
                monto=response.get('amount', 0),
                fecha=response.get('transaction_date', ''),
                mensaje="El pago fue rechazado",
                response_code=response.get('response_code')
            )
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error al confirmar pago con Transbank: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al confirmar el pago: {str(e)}"
        )


@router.get("/estado-transaccion/{numero_transaccion}")
async def obtener_estado_transaccion(
    numero_transaccion: str,
    db: Session = Depends(get_db)
):
    query = select(Pago).where(Pago.numero_transaccion == numero_transaccion)
    pagos = db.exec(query).all()
    
    if not pagos:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transacción no encontrada"
        )
    
    return {
        "numero_transaccion": numero_transaccion,
        "estado": pagos[0].estado_pago.value,
        "metodo_pago": pagos[0].metodo_pago.value,
        "pagos": [
            {
                "id": p.id,
                "tipo": p.tipo.value,
                "monto": float(p.monto),
                "estado": p.estado_pago.value,
                "fecha": p.fecha_pago.isoformat()
            }
            for p in pagos
        ],
        "total": sum(float(p.monto) for p in pagos)
    }


@router.get("/historial-transbank/{residente_id}")
async def obtener_historial_transbank(
    residente_id: int,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 50
):
    query = select(Pago).where(
        and_(
            Pago.residente_id == residente_id,
            Pago.metodo_pago == MetodoPago.WEBPAY
        )
    ).order_by(Pago.fecha_pago.desc()).offset(skip).limit(limit)
    
    pagos = db.exec(query).all()
    
    return {
        "pagos": [
            {
                "id": p.id,
                "tipo": p.tipo.value,
                "concepto": _obtener_concepto_pago(p, db),
                "monto": float(p.monto),
                "estado": p.estado_pago.value,
                "numero_transaccion": p.numero_transaccion,
                "fecha": p.fecha_pago.isoformat()
            }
            for p in pagos
        ],
        "total_registros": len(pagos)
    }


def _obtener_concepto_pago(pago: Pago, db: Session) -> str:
    concepto = ""
    
    if pago.tipo == TipoPago.GASTO_COMUN:
        gasto = db.get(GastoComun, pago.referencia_id)
        if gasto:
            concepto = f"Gasto Común - {gasto.mes}/{gasto.anio}"
        else:
            concepto = "Gasto Común"
    
    elif pago.tipo == TipoPago.MULTA:
        multa = db.get(Multa, pago.referencia_id)
        if multa:
            descripcion = multa.descripcion[:30] + "..." if len(multa.descripcion) > 30 else multa.descripcion
            concepto = f"Multa - {descripcion}"
        else:
            concepto = "Multa"
    
    elif pago.tipo == TipoPago.RESERVA:
        reserva = db.get(Reserva, pago.referencia_id)
        if reserva:
            from app.models.espacio_comun import EspacioComun
            espacio = db.get(EspacioComun, reserva.espacio_comun_id)
            nombre_espacio = espacio.nombre if espacio else "Espacio Común"
            fecha = reserva.fecha_reserva.strftime("%d/%m")
            concepto = f"Reserva {nombre_espacio} ({fecha})"
        else:
            concepto = "Reserva de espacio común"
    
    else:
        concepto = pago.tipo.value
    
    return concepto