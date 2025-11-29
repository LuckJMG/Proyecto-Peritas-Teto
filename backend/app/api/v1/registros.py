from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from app.core.database import get_session
from app.models.registro import RegistroModel, Registro, RegistroCreate, TipoEvento
from app.models.usuario import Usuario as UsuarioModel

router = APIRouter(prefix="/registros", tags=["registros"])


@router.get("/", response_model=List[Registro])
async def get_registros(
    skip: int = 0,
    limit: int = 100,
    tipo_evento: Optional[TipoEvento] = None,
    condominio_id: Optional[int] = None,
    session: Session = Depends(get_session)
):
    """Obtener todos los registros con filtros opcionales"""
    statement = select(RegistroModel, UsuarioModel).join(
        UsuarioModel, RegistroModel.usuario_id == UsuarioModel.id
    )
    
    if tipo_evento:
        statement = statement.where(RegistroModel.tipo_evento == tipo_evento)
    
    if condominio_id:
        statement = statement.where(RegistroModel.condominio_id == condominio_id)
    
    # Ordenar por fecha de creación descendente (lo más nuevo primero)
    statement = statement.offset(skip).limit(limit).order_by(RegistroModel.fecha_creacion.desc())
    
    results = session.exec(statement).all()
    
    # Combinar datos de registro y usuario
    registros = []
    for registro_model, usuario_model in results:
        registro = Registro.model_validate(registro_model)
        registro.usuario_nombre = usuario_model.nombre
        registro.usuario_apellido = usuario_model.apellido
        registros.append(registro)
    
    return registros


@router.get("/{registro_id}", response_model=Registro)
async def get_registro(
    registro_id: int,
    session: Session = Depends(get_session)
):
    """Obtener un registro específico"""
    statement = select(RegistroModel, UsuarioModel).join(
        UsuarioModel, RegistroModel.usuario_id == UsuarioModel.id
    ).where(RegistroModel.id == registro_id)
    
    result = session.exec(statement).first()
    
    if not result:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    
    registro_model, usuario_model = result
    registro = Registro.model_validate(registro_model)
    registro.usuario_nombre = usuario_model.nombre
    registro.usuario_apellido = usuario_model.apellido
    
    return registro


@router.post("/", response_model=Registro)
async def create_registro(
    registro_data: RegistroCreate,
    session: Session = Depends(get_session)
):
    """Crear un nuevo registro (Solo lectura/creación, inmutable)"""
    # Verificar que el usuario existe
    usuario = session.get(UsuarioModel, registro_data.usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    # Crear el registro
    registro = RegistroModel(**registro_data.model_dump())
    session.add(registro)
    session.commit()
    session.refresh(registro)
    
    # Preparar respuesta con datos del usuario
    registro_response = Registro.model_validate(registro)
    registro_response.usuario_nombre = usuario.nombre
    registro_response.usuario_apellido = usuario.apellido
    
    return registro_response