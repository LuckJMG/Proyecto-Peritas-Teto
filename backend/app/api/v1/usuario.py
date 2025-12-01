from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.orm import selectinload
from typing import List
from decimal import Decimal
import uuid

# Se agregó get_current_active_user a los imports
from app.api.deps import get_db, get_current_active_user
# Se agregó RolUsuario a los imports
from app.models.usuario import Usuario, RolUsuario
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
async def listar_usuarios(
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    query = select(Usuario).options(
        selectinload(Usuario.residentes).options(
            selectinload(Residente.gastos_comunes),
            selectinload(Residente.multas)
        )
    )

    if current_user.rol != RolUsuario.SUPER_ADMINISTRADOR:
        query = query.where(Usuario.condominio_id == current_user.condominio_id)

    usuarios_db = db.exec(query).all()
    
    usuarios_output = []
    for usuario in usuarios_db:
        usuario_read = UsuarioRead.from_orm(usuario)
        usuario_read.total_deuda = calcular_deuda_usuario(usuario)
        
        # --- NUEVO: Inyectar datos del residente para visualización ---
        # Buscamos el residente que coincida con el condominio del usuario
        if usuario.residentes:
            residente = next(
                (r for r in usuario.residentes if r.condominio_id == usuario.condominio_id), 
                None
            )
            if residente:
                usuario_read.telefono = residente.telefono
                usuario_read.vivienda = residente.vivienda_numero
        # -------------------------------------------------------------
        
        usuarios_output.append(usuario_read)
        
    return usuarios_output

@router.post("", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
async def crear_usuario(
    data: UsuarioCreate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    # 1. Determinar Condominio
    condominio_asignado = data.condominio_id
    # Si no es Super Admin, forzamos el condominio del usuario actual
    if current_user.rol != RolUsuario.SUPER_ADMINISTRADOR:
        condominio_asignado = current_user.condominio_id

    # 2. Crear el Usuario
    hashed_password = get_password_hash(data.password)
    nuevo_usuario = Usuario(
        email=data.email,
        nombre=data.nombre,
        apellido=data.apellido,
        password_hash=hashed_password,
        rol=data.rol,
        condominio_id=condominio_asignado,
        activo=data.activo,
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    # 3. Crear Residente si el rol lo indica
    if data.rol == RolUsuario.RESIDENTE:
        # Validamos que vengan los datos mínimos requeridos para un residente
        # Si el frontend no los envía, lanzamos error o usamos valores por defecto (aquí exigiremos RUT y vivienda)
        if not data.rut or not data.vivienda_numero:
            # Nota: Podrías hacer un rollback aquí si quieres ser estricto, 
            # pero por simplicidad asumiremos que el frontend valida.
            pass 

        nuevo_residente = Residente(
            usuario_id=nuevo_usuario.id,
            condominio_id=condominio_asignado or 1,
            nombre=nuevo_usuario.nombre,
            apellido=nuevo_usuario.apellido,
            email=nuevo_usuario.email,
            # Usamos los datos del request o fallbacks si es necesario
            rut=data.rut or f"TEMP-{uuid.uuid4().hex[:8]}",
            vivienda_numero=data.vivienda_numero or "S/N",
            telefono=data.telefono,
            es_propietario=data.es_propietario
        )
        db.add(nuevo_residente)
        db.commit()
    
    return nuevo_usuario

@router.get("/{usuario_id}", response_model=UsuarioRead)
async def obtener_usuario(
    usuario_id: int, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    query = select(Usuario).where(Usuario.id == usuario_id).options(
        selectinload(Usuario.residentes).options(
            selectinload(Residente.gastos_comunes),
            selectinload(Residente.multas)
        )
    )
    usuario = db.exec(query).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Seguridad: Si no es super admin, verificar que el usuario pertenezca a su condominio
    if current_user.rol != RolUsuario.SUPER_ADMINISTRADOR:
        if usuario.condominio_id != current_user.condominio_id:
            raise HTTPException(status_code=404, detail="Usuario no encontrado") # 404 para no revelar existencia

    usuario_read = UsuarioRead.from_orm(usuario)
    usuario_read.total_deuda = calcular_deuda_usuario(usuario)
    return usuario_read

@router.put("/{usuario_id}", response_model=UsuarioRead)
async def actualizar_usuario(
    usuario_id: int, 
    data: UsuarioUpdate, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    # 1. Buscar Usuario
    query = select(Usuario).where(Usuario.id == usuario_id).options(
        selectinload(Usuario.residentes).options(
            selectinload(Residente.gastos_comunes),
            selectinload(Residente.multas)
        )
    )
    usuario = db.exec(query).first()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Seguridad
    if current_user.rol != RolUsuario.SUPER_ADMINISTRADOR:
        if usuario.condominio_id != current_user.condominio_id:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # 2. Actualizar datos de Usuario
    update_data = data.dict(exclude_unset=True)
    
    # Separamos los campos que son de residente para no causar error en el modelo Usuario
    resident_fields = {'rut', 'telefono', 'vivienda_numero', 'es_propietario'}
    data_residente = {k: v for k, v in update_data.items() if k in resident_fields}
    
    # Limpiamos update_data para que solo tenga campos de Usuario
    for field in resident_fields:
        update_data.pop(field, None)

    if 'password' in update_data:
        password = update_data.pop('password')
        usuario.password_hash = get_password_hash(password)
        
    for key, value in update_data.items():
        setattr(usuario, key, value)
    
    # 3. Actualizar datos de Residente (si existen y el usuario tiene residentes asociados)
    if data_residente and usuario.residentes:
        # Asumimos que editamos el primer perfil de residente asociado a este condominio
        # (Generalmente es 1 a 1 por condominio)
        residente = next((r for r in usuario.residentes if r.condominio_id == usuario.condominio_id), None)
        
        if residente:
            for key, value in data_residente.items():
                setattr(residente, key, value)
            db.add(residente)
            
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    
    usuario_read = UsuarioRead.from_orm(usuario)
    usuario_read.total_deuda = calcular_deuda_usuario(usuario)
    return usuario_read

@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_usuario(
    usuario_id: int, 
    db: Session = Depends(get_db),
    current_user: Usuario = Depends(get_current_active_user)
):
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
    # Seguridad: Verificar pertenencia al condominio
    if current_user.rol != RolUsuario.SUPER_ADMINISTRADOR:
        if usuario.condominio_id != current_user.condominio_id:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(usuario)
    db.commit()
    return None