from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from typing import List
from decimal import Decimal
import uuid # <--- IMPORTANTE: Agregamos esto

from app.api.deps import get_db
from app.models.usuario import Usuario
from app.models.residente import Residente
from app.models.gasto_comun import EstadoGastoComun
from app.models.multa import EstadoMulta
from app.schemas.usuario import UsuarioRead, UsuarioCreate, UsuarioUpdate
from app.core.security import get_password_hash

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

def calcular_deuda_usuario(usuario: Usuario) -> float:
    deuda = Decimal(0)
    if not usuario.residentes:
        return float(deuda)

    estados_deuda_gc = {
        EstadoGastoComun.PENDIENTE, 
        EstadoGastoComun.VENCIDO, 
        EstadoGastoComun.MOROSO
    }
    
    for residente in usuario.residentes:
        if residente.gastos_comunes:
            deuda += sum(
                gc.monto_total 
                for gc in residente.gastos_comunes 
                if gc.estado in estados_deuda_gc
            )
        if residente.multas:
            deuda += sum(
                m.monto 
                for m in residente.multas 
                if m.estado == EstadoMulta.PENDIENTE
            )
    return float(deuda)

@router.get("", response_model=List[UsuarioRead])
async def listar_usuarios(db: Session = Depends(get_db)):
    query = select(Usuario).options(
        selectinload(Usuario.residentes).options(
            selectinload(Residente.gastos_comunes),
            selectinload(Residente.multas)
        )
    )
    usuarios_db = db.exec(query).all()
    
    usuarios_output = []
    for usuario in usuarios_db:
        usuario_read = UsuarioRead.from_orm(usuario)
        usuario_read.total_deuda = calcular_deuda_usuario(usuario)
        usuarios_output.append(usuario_read)
        
    return usuarios_output

@router.post("", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
async def crear_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
    # 1. Crear el Usuario
    hashed_password = get_password_hash(data.password)
    nuevo_usuario = Usuario(
        email=data.email,
        nombre=data.nombre,
        apellido=data.apellido,
        password_hash=hashed_password,
        rol=data.rol,
        condominio_id=data.condominio_id,
        activo=data.activo,
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    # 2. Crear Residente Automáticamente (SOLUCIÓN DEL ERROR 500)
    if data.rol == "RESIDENTE":
        # Generamos un RUT temporal único para cumplir la restricción UNIQUE de la BD
        rut_temporal = f"TEMP-{uuid.uuid4().hex[:8]}"
        
        nuevo_residente = Residente(
            usuario_id=nuevo_usuario.id,
            condominio_id=nuevo_usuario.condominio_id or 1,
            # Campos obligatorios que faltaban y causaban el crash:
            nombre=nuevo_usuario.nombre,
            apellido=nuevo_usuario.apellido,
            email=nuevo_usuario.email,
            rut=rut_temporal,          # Obligatorio y único
            vivienda_numero="S/N",     # Obligatorio
            es_propietario=False       # Obligatorio
        )
        db.add(nuevo_residente)
        db.commit()
    
    return nuevo_usuario

@router.get("/{usuario_id}", response_model=UsuarioRead)
async def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    query = select(Usuario).where(Usuario.id == usuario_id).options(
        selectinload(Usuario.residentes).options(
            selectinload(Residente.gastos_comunes),
            selectinload(Residente.multas)
        )
    )
    usuario = db.exec(query).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    usuario_read = UsuarioRead.from_orm(usuario)
    usuario_read.total_deuda = calcular_deuda_usuario(usuario)
    return usuario_read

@router.put("/{usuario_id}", response_model=UsuarioRead)
async def actualizar_usuario(usuario_id: int, data: UsuarioUpdate, db: Session = Depends(get_db)):
    query = select(Usuario).where(Usuario.id == usuario_id).options(
        selectinload(Usuario.residentes).options(
            selectinload(Residente.gastos_comunes),
            selectinload(Residente.multas)
        )
    )
    usuario = db.exec(query).first()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    update_data = data.dict(exclude_unset=True)
    if 'password' in update_data:
        password = update_data.pop('password')
        usuario.password_hash = get_password_hash(password)
        
    for key, value in update_data.items():
        setattr(usuario, key, value)
    
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    
    usuario_read = UsuarioRead.from_orm(usuario)
    usuario_read.total_deuda = calcular_deuda_usuario(usuario)
    return usuario_read

@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    db.delete(usuario)
    db.commit()
    return None