from datetime import datetime
from fastapi import HTTPException, status, Depends
from sqlmodel import Session, select
from app.apis.autenticacin_api_base import BaseAutenticacinApi
from app.models.auth_login_post_request import AuthLoginPostRequest
from app.models.auth_response import AuthResponse
from app.models.usuario import Usuario as UsuarioModel
from app.core.database import get_session
from app.core.security import verify_password, create_access_token, create_refresh_token


class AutenticacionApi(BaseAutenticacinApi):
    
    async def auth_login_post(
        self, 
        auth_login_post_request: AuthLoginPostRequest,
    ) -> AuthResponse:
        """
        Inicia sesion de un usuario y devuelve tokens JWT
        """
        session: Session = next(get_session())
        
        try:
            # Buscar usuario por email
            statement = select(UsuarioModel).where(
                UsuarioModel.email == auth_login_post_request.email
            )
            usuario = session.exec(statement).first()
            
            # Verificar que el usuario existe
            if not usuario:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales incorrectas"
                )
            
            # Verificar que el usuario esta activo
            if not usuario.activo:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Usuario inactivo"
                )
            
            # Verificar la contrasena
            if not verify_password(
                auth_login_post_request.password.get_secret_value(),
                usuario.password_hash
            ):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales incorrectas"
                )
            
            # Actualizar ultimo acceso
            usuario.ultimo_acceso = datetime.utcnow()
            session.add(usuario)
            session.commit()
            session.refresh(usuario)
            
            # Crear tokens
            access_token = create_access_token(data={"sub": usuario.id})
            refresh_token = create_refresh_token(data={"sub": usuario.id})
            
            # Convertir el modelo SQLModel a modelo Pydantic para la respuesta
            from app.models.usuario import Usuario as UsuarioPydantic
            
            usuario_response = UsuarioPydantic(
                id=usuario.id,
                email=usuario.email,
                nombre=usuario.nombre,
                apellido=usuario.apellido,
                rol=usuario.rol,
                condominioId=usuario.condominio_id,
                activo=usuario.activo,
                fechaCreacion=usuario.fecha_creacion,
                ultimoAcceso=usuario.ultimo_acceso
            )
            
            return AuthResponse(
                accessToken=access_token,
                refreshToken=refresh_token,
                usuario=usuario_response
            )
            
        finally:
            session.close()
    
    async def auth_logout_post(self) -> None:
        """
        Cierra la sesion del usuario.
        En una implementacion con JWT stateless, esto es principalmente
        del lado del cliente (eliminar el token).
        Aqui podriamos implementar una blacklist de tokens si fuera necesario.
        """
        # En una implementacion basica con JWT, no hay mucho que hacer en el servidor
        # El cliente debe eliminar el token
        return None
