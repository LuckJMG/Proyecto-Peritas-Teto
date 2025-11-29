from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from typing import List
from decimal import Decimal

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
        # Sumar gastos comunes pendientes
        if residente.gastos_comunes:
            deuda += sum(
                gc.monto_total 
                for gc in residente.gastos_comunes 
                if gc.estado in estados_deuda_gc
            )
        # Sumar multas pendientes
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
    
    # Conversión explícita a Pydantic antes de modificar
    usuarios_output = []
    for usuario in usuarios_db:
        # 'from_orm' crea una copia en el esquema Pydantic que sí acepta el campo extra
        usuario_read = UsuarioRead.from_orm(usuario)
        usuario_read.total_deuda = calcular_deuda_usuario(usuario)
        usuarios_output.append(usuario_read)
        
    return usuarios_output

@router.post("", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
async def crear_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
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
    
    # No asignamos total_deuda manual aquí para evitar el error.
    # El response_model (UsuarioRead) usará su default 0.0 automáticamente.
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
    
    # Conversión explícita
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
    
    # Conversión explícita
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
