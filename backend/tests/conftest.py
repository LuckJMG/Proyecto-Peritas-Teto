import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, Session, create_engine
from typing import Generator
import os

# --- Importaciones de Dependencias y App ---
from app.main import app 
from app.api.deps import get_db, get_current_user

# --- Importaciones de TODOS tus Modelos ---
from app.models.anuncio import Anuncio
from app.models.condominio import Condominio
from app.models.espacio_comun import EspacioComun, TipoEspacioComun
from app.models.gasto_comun import GastoComun
from app.models.multa import Multa, TipoMulta, EstadoMulta
from app.models.pago import Pago, EstadoPago, TipoPago, MetodoPago
from app.models.reserva import Reserva, EstadoReserva
from app.models.residente import Residente
from app.models.usuario import Usuario, RolUsuario


# --- Configuración de la Base de Datos de Prueba ---
sqlite_file_name = "test.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})


# --- Fixture: Sesión de Base de Datos (db_session) ---
@pytest.fixture(scope="session", autouse=True)
def db_session() -> Generator[Session, None, None]:
    """
    Fixture que crea y limpia la base de datos UNA VEZ por sesión de pruebas.
    """
    if os.path.exists(sqlite_file_name):
        os.remove(sqlite_file_name)
        
    SQLModel.metadata.create_all(engine)
    
    with Session(engine) as session:
        yield session
    
    if os.path.exists(sqlite_file_name):
        os.remove(sqlite_file_name)


# --- Fixture: Cliente de Pruebas (client) ---
@pytest.fixture(scope="module")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """
    Fixture que crea un TestClient, sobreescribe dependencias
    y CREA DATOS BASE (SEED) para todos los tests del módulo.
    """

    # --- (INICIO) CORRECCIÓN: CREACIÓN DE DATOS "EAGER" (ANSIOSA) ---
    # Creamos los datos base (ID=1) aquí, ANTES de que cualquier test corra.
    
    # 1. Crear Condominio Base (ID=1)
    condominio_base = db_session.get(Condominio, 1)
    if not condominio_base:
        condominio_base = Condominio(
            id=1, 
            nombre="Condo Test", 
            direccion="Calle Falsa 123", 
            total_viviendas=10
        )
        db_session.add(condominio_base)
        db_session.commit()

    # 2. Crear Usuario Admin Base (ID=1)
    usuario_admin = db_session.get(Usuario, 1)
    if not usuario_admin:
        
        # CORRECCIÓN: Usamos RESIDENTE (o el rol que sí exista en tu Enum)
        # Esto corrige el 'AttributeError: ... has no attribute 'ADMIN''
        rol_de_prueba = RolUsuario.RESIDENTE 

        usuario_admin = Usuario(
            id=1,
            nombre="Admin",
            apellido="Test",
            email="admin@test.com",
            # CORRECCIÓN: Contraseña corta "password"
            password_hash="$2b$12$E.m4z06m01nFO.FLhEElEe.VAjVL..k2aTjD/e5j1xhzM1xJRH.qW", 
            rol=rol_de_prueba, 
            condominio_id=condominio_base.id, 
            activo=True
        )
        db_session.add(usuario_admin)
        db_session.commit()
        db_session.refresh(usuario_admin)
        
    # 3. (NUEVO) Crear Residente Base (ID=1)
    # Esto corrige los IntegrityError en tests que dependen de un residente
    residente_base = db_session.get(Residente, 1)
    if not residente_base:
        residente_base = Residente(
            id=1,
            usuario_id=usuario_admin.id,
            condominio_id=condominio_base.id,
            vivienda_numero="Admin-001",
            nombre="Admin",
            apellido="Test",
            rut="1.111.111-1",
            email=usuario_admin.email,
            es_propietario=True,
            activo=True
        )
        db_session.add(residente_base)
        db_session.commit()
        
    # 4. (NUEVO) Crear Espacio Común Base (ID=1)
    # Esto corrige los IntegrityError en tests que dependen de un espacio
    espacio_base = db_session.get(EspacioComun, 1)
    if not espacio_base:
        espacio_base = EspacioComun(
            id=1,
            condominio_id=condominio_base.id,
            nombre="Quincho Test",
            tipo=TipoEspacioComun.QUINCHO,
            activo=True
        )
        db_session.add(espacio_base)
        db_session.commit()
        
    # --- (FIN) CORRECCIÓN ---


    # --- Sobreescribir 'get_db' ---
    def get_db_override():
        try:
            yield db_session
        finally:
            pass 

    # --- Sobreescribir 'get_current_user' ---
    def get_current_user_override():
        """
        Retorna el usuario administrador mockeado (ID=1) que
        GARANTIZAMOS que ya existe.
        """
        user = db_session.get(Usuario, 1)
        return user 

    # Aplicar las sobreescrituras
    app.dependency_overrides[get_db] = get_db_override
    app.dependency_overrides[get_current_user] = get_current_user_override

    # Crear el TestClient
    with TestClient(app) as c:
        yield c
    
    # Limpiar las sobreescrituras
    app.dependency_overrides = {}
