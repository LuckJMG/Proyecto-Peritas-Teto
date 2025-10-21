from sqlmodel import SQLModel
from .database import engine
from app.models import (
    Usuario, Condominio, Residente, GastoComun,
    Multa, EspacioComun, Reserva, Pago, Anuncio
)

def init_db():
    """
    Crea todas las tablas en la base de datos. (pa test)
    En produccion se usa Alembic.
    """
    SQLModel.metadata.create_all(engine)
    print("Base de datos inicializada correctamente")

if __name__ == "__main__":
    init_db()