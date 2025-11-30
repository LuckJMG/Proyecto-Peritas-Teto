from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

# Dependencias
from app.api.deps import get_db

# Importar modelos y schemas
from app.models.reserva import Reserva
from app.schemas.reserva import ReservaCreate

router = APIRouter(prefix="/reservas", tags=["Reservas"])

# GET /reservas - Listar todas
@router.get("", response_model=List[Reserva])
async def listar_reservas(db: Session = Depends(get_db)):
    """
    Obtiene una lista de todas las reservas.
    """
    items = db.exec(select(Reserva)).all()
    return items

# POST /reservas - Crear
@router.post("", response_model=Reserva, status_code=status.HTTP_201_CREATED)
async def crear_reserva(data: ReservaCreate, db: Session = Depends(get_db)):
    """
    Crea una nueva reserva transformando datetimes a formato fecha/hora de BD.
    """
    # 1. Transformación de fechas
    fecha_reserva = data.fecha_inicio.date()
    hora_inicio = data.fecha_inicio.time()
    hora_fin = data.fecha_fin.time()

    # 2. Manejo de cantidad de personas (Persistencia en observaciones)
    obs_texto = f"Asistentes: {data.cantidad_personas}"
    if data.observaciones:
        obs_texto += f" | {data.observaciones}"

    # 3. Creación del objeto DB
    nueva_reserva = Reserva(
        residente_id=data.residente_id,
        espacio_comun_id=data.espacio_comun_id,
        fecha_reserva=fecha_reserva,
        hora_inicio=hora_inicio,
        hora_fin=hora_fin,
        observaciones=obs_texto
    )
    
    db.add(nueva_reserva)
    db.commit()
    db.refresh(nueva_reserva)
    
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
    
    db.delete(item)
    db.commit()
    return None
