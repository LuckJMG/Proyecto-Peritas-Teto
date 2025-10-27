from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from app.api.deps import get_db
from app.models.usuario import Usuario  # modelo SQLModel (tabla real)
from app.schemas.usuario import UsuarioRead, UsuarioCreate, UsuarioUpdate  # esquemas Pydantic

router = APIRouter(prefix="/usuarios", tags=["Usuarios"])

# ---------------------------
# GET /usuarios - listar todos
# ---------------------------
@router.get("", response_model=List[UsuarioRead])
async def listar_usuarios(db: Session = Depends(get_db)):
    usuarios = db.exec(select(Usuario)).all()
    return usuarios


# ---------------------------
# POST /usuarios - crear
# ---------------------------
@router.post("", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
async def crear_usuario(data: UsuarioCreate, db: Session = Depends(get_db)):
    nuevo_usuario = Usuario(**data.dict())
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario


# ---------------------------
# GET /usuarios/{usuario_id} - obtener uno
# ---------------------------
@router.get("/{usuario_id}", response_model=UsuarioRead)
async def obtener_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    return usuario


# ---------------------------
# PUT /usuarios/{usuario_id} - actualizar
# ---------------------------
@router.put("/{usuario_id}", response_model=UsuarioRead)
async def actualizar_usuario(usuario_id: int, data: UsuarioUpdate, db: Session = Depends(get_db)):
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(usuario, key, value)
    
    db.add(usuario)
    db.commit()
    db.refresh(usuario)
    return usuario


# ---------------------------
# DELETE /usuarios/{usuario_id} - eliminar
# ---------------------------
@router.delete("/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.get(Usuario, usuario_id)
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    db.delete(usuario)
    db.commit()
    return None
