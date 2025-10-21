from typing import Generator
from fastapi import Depends, HTTPException, status
from sqlmodel import Session
from app.core.database import get_session
from app.core.security import get_current_user
from app.models.usuario import Usuario, RolUsuario


def get_db() -> Generator:
    """
    Dependencia para obtener sesión de base de datos
    """
    try:
        db = next(get_session())
        yield db
    finally:
        db.close()


def get_current_active_user(
    current_user: Usuario = Depends(get_current_user)
) -> Usuario:
    """
    Dependencia para verificar que el usuario actual esté activo
    """
    if not current_user.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario inactivo"
        )
    return current_user


def get_current_super_admin(
    current_user: Usuario = Depends(get_current_active_user)
) -> Usuario:
    """
    Dependencia para verificar que el usuario sea super administrador
    """
    if current_user.rol != RolUsuario.SUPER_ADMINISTRADOR:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de super administrador"
        )
    return current_user


def get_current_admin(
    current_user: Usuario = Depends(get_current_active_user)
) -> Usuario:
    """
    Dependencia para verificar que el usuario sea administrador o super admin
    """
    if current_user.rol not in [
        RolUsuario.SUPER_ADMINISTRADOR,
        RolUsuario.ADMINISTRADOR
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de administrador"
        )
    return current_user


def get_current_staff(
    current_user: Usuario = Depends(get_current_active_user)
) -> Usuario:
    """
    Dependencia para verificar que el usuario sea staff (admin, conserje o directiva)
    """
    if current_user.rol not in [
        RolUsuario.SUPER_ADMINISTRADOR,
        RolUsuario.ADMINISTRADOR,
        RolUsuario.CONSERJE,
        RolUsuario.DIRECTIVA
    ]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Se requieren permisos de staff"
        )
    return current_user
