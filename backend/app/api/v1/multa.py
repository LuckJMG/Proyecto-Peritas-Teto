from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from datetime import date
from decimal import Decimal

# Dependencias
from app.api.deps import get_db
# Asumimos que existe para obtener el usuario actual (admin)
# Si no tienes auth habilitado globalmente, usaremos un ID por defecto o pasaremos el ID en el body
# from app.api.deps import get_current_user 

# Modelos
from app.models.multa import Multa, TipoMulta, EstadoMulta
from app.models.gasto_comun import GastoComun, EstadoGastoComun
from app.models.usuario import Usuario

router = APIRouter(prefix="/multas", tags=["Multas"])

# GET /multas - Listar todas (con filtro opcional por residente)
@router.get("", response_model=List[Multa])
async def listar_multas(
    residente_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Obtiene una lista de todas las multas. Puede filtrar por residente_id.
    """
    query = select(Multa)
    if residente_id:
        query = query.where(Multa.residente_id == residente_id)
    
    items = db.exec(query).all()
    return items

# POST /multas - Crear Manual
@router.post("", response_model=Multa, status_code=status.HTTP_201_CREATED)
async def crear_multa(data: Multa, db: Session = Depends(get_db)):
    """
    Crea una nueva multa manual.
    """
    # Validar que el residente y condominio existan (opcional pero recomendado)
    # item = Multa.model_validate(data) # Esto falla si data es un dict parcial, mejor usar constructor
    
    # Aseguramos estado pendiente por defecto si no viene
    if not data.estado:
        data.estado = EstadoMulta.PENDIENTE
        
    db.add(data)
    db.commit()
    db.refresh(data)
    
    return data

# POST /multas/procesar-atrasos - Automáticas
@router.post("/procesar-atrasos", status_code=status.HTTP_200_OK)
async def procesar_atrasos(
    admin_id: int, # ID del usuario que ejecuta la acción (Admin)
    db: Session = Depends(get_db)
):
    """
    Busca gastos comunes vencidos y genera multas automáticas.
    """
    today = date.today()
    
    # 1. Buscar gastos comunes vencidos (PENDIENTE y fecha_vencimiento < hoy)
    # OJO: Se asume que si ya está VENCIDO o MOROSO ya se procesó o se está procesando, 
    # pero aquí buscamos especificamente los que siguen en PENDIENTE pero ya vencieron.
    gastos_vencidos = db.exec(select(GastoComun).where(
        GastoComun.fecha_vencimiento < today,
        GastoComun.estado == EstadoGastoComun.PENDIENTE
    )).all()

    multas_creadas = 0

    for gc in gastos_vencidos:
        # Cambiar estado del gasto común a VENCIDO
        gc.estado = EstadoGastoComun.VENCIDO
        db.add(gc)

        # Verificar si ya existe una multa por retraso para este gasto común (mes/anio/residente)
        # Usamos la descripción para identificarla en este MVP rápido
        descripcion_multa = f"Multa automática por atraso Gasto Común {gc.mes}/{gc.anio}"
        
        existe_multa = db.exec(select(Multa).where(
            Multa.residente_id == gc.residente_id,
            Multa.descripcion == descripcion_multa,
            Multa.tipo == TipoMulta.RETRASO_PAGO
        )).first()

        if not existe_multa:
            # Crear Multa
            # Monto fijo de multa por ejemplo $5.000 o un % del monto total. Usaremos 5000 para demo.
            monto_multa = Decimal("5000.00")
            
            nueva_multa = Multa(
                residente_id=gc.residente_id,
                condominio_id=gc.condominio_id,
                tipo=TipoMulta.RETRASO_PAGO,
                descripcion=descripcion_multa,
                monto=monto_multa,
                estado=EstadoMulta.PENDIENTE,
                fecha_emision=today,
                creado_por=admin_id
            )
            db.add(nueva_multa)
            multas_creadas += 1

    db.commit()
    
    return {
        "message": "Proceso completado", 
        "gastos_vencidos_detectados": len(gastos_vencidos),
        "multas_creadas": multas_creadas
    }

# GET /multas/{item_id} - Obtener una
@router.get("/{item_id}", response_model=Multa)
async def obtener_multa(item_id: int, db: Session = Depends(get_db)):
    """
    Obtiene una multa específica por su ID.
    """
    item = db.get(Multa, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Multa no encontrada")
    
    return item

# PUT /multas/{item_id} - Actualizar
@router.put("/{item_id}", response_model=Multa)
async def actualizar_multa(item_id: int, data: Multa, db: Session = Depends(get_db)):
    """
    Actualiza una multa existente.
    """
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

# DELETE /multas/{item_id} - Eliminar
@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_multa(item_id: int, db: Session = Depends(get_db)):
    """
    Elimina una multa por su ID.
    """
    item = db.get(Multa, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Multa no encontrada")
    
    db.delete(item)
    db.commit()
    return None