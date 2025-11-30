from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr
import uuid # <--- Importar uuid

from app.api.deps import get_db
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.models.usuario import Usuario
from app.models.residente import Residente

router = APIRouter(prefix="/auth", tags=["Autenticación"])


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    usuario: dict


@router.post("/login", response_model=LoginResponse)
async def login(
    credentials: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Inicia sesión y devuelve tokens JWT.
    """
    statement = select(Usuario).where(Usuario.email == credentials.email)
    usuario = db.exec(statement).first()
    
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    if not verify_password(credentials.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    # --- AUTOCURACIÓN CORREGIDA ---
    if usuario.rol == "RESIDENTE":
        try:
            stmt_res = select(Residente).where(Residente.usuario_id == usuario.id)
            residente_existente = db.exec(stmt_res).first()
            
            if not residente_existente:
                print(f"Auto-creando perfil de Residente para usuario {usuario.id}")
                rut_temporal = f"TEMP-{uuid.uuid4().hex[:8]}"
                
                nuevo_residente = Residente(
                    usuario_id=usuario.id,
                    condominio_id=usuario.condominio_id or 1,
                    # Campos obligatorios rellenados:
                    nombre=usuario.nombre,
                    apellido=usuario.apellido,
                    email=usuario.email,
                    rut=rut_temporal,
                    vivienda_numero="S/N",
                    es_propietario=False
                )
                db.add(nuevo_residente)
                db.commit()
                db.refresh(usuario)
        except Exception as e:
            print(f"Error en autocuración de residente: {e}")
            # Continuamos el login aunque falle la creación del perfil
    # ------------------------------

    usuario.ultimo_acceso = datetime.utcnow()
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    
    access_token = create_access_token(data={"sub": str(usuario.id)})
    refresh_token = create_refresh_token(data={"sub": str(usuario.id)})
    
    usuario_data = {
        "id": usuario.id,
        "email": usuario.email,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "rol": usuario.rol.value if hasattr(usuario.rol, 'value') else usuario.rol,
        "condominio_id": usuario.condominio_id,
        "activo": usuario.activo,
        "fecha_creacion": usuario.fecha_creacion.isoformat(),
        "ultimo_acceso": usuario.ultimo_acceso.isoformat() if usuario.ultimo_acceso else None
    }
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        usuario=usuario_data
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout():
    return None


@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    try:
        payload = decode_token(refresh_token)
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token inválido"
            )
        
        user_id = int(payload.get("sub"))
        statement = select(Usuario).where(Usuario.id == user_id)
        usuario = db.exec(statement).first()
        
        if not usuario or not usuario.activo:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuario inválido o inactivo"
            )
        
        new_access_token = create_access_token(data={"sub": str(usuario.id)})
        
        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token inválido o expirado"
        )