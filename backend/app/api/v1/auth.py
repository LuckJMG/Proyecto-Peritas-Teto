from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from pydantic import BaseModel, EmailStr

from app.api.deps import get_db
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token
)
from app.models.usuario import Usuario

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
    Inicia sesión y devuelve tokens JWT
    """
    # Buscar usuario por email
    statement = select(Usuario).where(Usuario.email == credentials.email)
    usuario = db.exec(statement).first()
    
    # Verificar que el usuario existe
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    # Verificar que el usuario está activo
    if not usuario.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    
    # Verificar la contraseña
    if not verify_password(credentials.password, usuario.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Credenciales incorrectas"
        )
    
    # Actualizar último acceso
    usuario.ultimo_acceso = datetime.utcnow()
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    
    # Crear tokens
    access_token = create_access_token(data={"sub": str(usuario.id)})
    refresh_token = create_refresh_token(data={"sub": str(usuario.id)})
    
    # Preparar respuesta
    usuario_data = {
        "id": usuario.id,
        "email": usuario.email,
        "nombre": usuario.nombre,
        "apellido": usuario.apellido,
        "rol": usuario.rol.value,
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
    """
    Cierra la sesión del usuario.
    En JWT stateless, esto se maneja principalmente del lado del cliente.
    """
    # En producción, podrías implementar una blacklist de tokens aquí
    return None


@router.post("/refresh")
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """
    Refresca el access token usando el refresh token
    """
    from app.core.security import decode_token
    
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
        
        # Crear nuevo access token
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
