from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from app.api.deps import get_db
from app.models.anuncio import Anuncio
from app.schemas.anuncio import AnuncioInput

router = APIRouter(prefix="/anuncios", tags=["Anuncios"])


# GET /anuncios - Listar todos
@router.get("", response_model=List[Anuncio])
async def listar(db: Session = Depends(get_db)):
    anuncios = db.exec(select(Anuncio)).all()
    return anuncios


# GET /anuncios/{id} - Obtener uno
@router.get("/{anuncio_id}", response_model=Anuncio)
async def obtener(anuncio_id: int, db: Session = Depends(get_db)):
    anuncio = db.get(Anuncio, anuncio_id)
    if not anuncio:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    return anuncio


# POST /anuncios - Crear
@router.post("", response_model=Anuncio, status_code=status.HTTP_201_CREATED)
async def crear(data: AnuncioInput, db: Session = Depends(get_db)):
    anuncio = Anuncio(**data.dict())
    db.add(anuncio)
    db.commit()
    db.refresh(anuncio)
    return anuncio


# PUT /anuncios/{id} - Actualizar
@router.put("/{anuncio_id}", response_model=Anuncio)
async def actualizar(anuncio_id: int, data: AnuncioInput, db: Session = Depends(get_db)):
    anuncio = db.get(Anuncio, anuncio_id)
    if not anuncio:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    
    for key, value in data.dict(exclude_unset=True).items():
        setattr(anuncio, key, value)
    
    db.add(anuncio)
    db.commit()
    db.refresh(anuncio)
    return anuncio


# DELETE /anuncios/{id} - Eliminar
@router.delete("/{anuncio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar(anuncio_id: int, db: Session = Depends(get_db)):
    anuncio = db.get(Anuncio, anuncio_id)
    if not anuncio:
        raise HTTPException(status_code=404, detail="Anuncio no encontrado")
    
    db.delete(anuncio)
    db.commit()
    return None
