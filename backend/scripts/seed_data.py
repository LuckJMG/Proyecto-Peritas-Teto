import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import date, datetime
from sqlmodel import Session
from app.core.database import engine
from app.core.security import get_password_hash
from app.models import (
    Usuario, RolUsuario,
    Condominio,
    Residente
)


def seed_database():
    """
    Carga datos iniciales en la base de datos para desarrollo y testing
    """
    print("Iniciando seed de datos...")
    
    with Session(engine) as session:
        # Verificar si ya hay datos
        existing_condominios = session.query(Condominio).first()
        if existing_condominios:
            print("La base de datos ya contiene datos. Abortando seed.")
            return
        
        # Crear condominio de prueba
        condominio = Condominio(
            nombre="Condominio Los Pinos",
            direccion="Av. Los Pinos 123, Santiago",
            total_viviendas=50,
            activo=True,
            fecha_creacion=datetime.utcnow()
        )
        session.add(condominio)
        session.commit()
        session.refresh(condominio)
        print(f"Condominio creado: {condominio.nombre}")
        
        # Crear super administrador
        super_admin = Usuario(
            email="admin@casitasteto.cl",
            nombre="Super",
            apellido="Admin",
            password_hash=get_password_hash("admin123"),
            rol=RolUsuario.SUPER_ADMINISTRADOR,
            condominio_id=None,
            activo=True,
            fecha_creacion=datetime.utcnow()
        )
        session.add(super_admin)
        session.commit()
        session.refresh(super_admin)
        print(f"Super Admin creado: {super_admin.email}")
        
        # Crear administrador del condominio
        admin = Usuario(
            email="admin@lospinos.cl",
            nombre="Juan",
            apellido="Pérez",
            password_hash=get_password_hash("admin123"),
            rol=RolUsuario.ADMINISTRADOR,
            condominio_id=condominio.id,
            activo=True,
            fecha_creacion=datetime.utcnow()
        )
        session.add(admin)
        session.commit()
        session.refresh(admin)
        print(f"Administrador creado: {admin.email}")
        
        # Crear conserje
        conserje = Usuario(
            email="conserje@lospinos.cl",
            nombre="María",
            apellido="González",
            password_hash=get_password_hash("conserje123"),
            rol=RolUsuario.CONSERJE,
            condominio_id=condominio.id,
            activo=True,
            fecha_creacion=datetime.utcnow()
        )
        session.add(conserje)
        session.commit()
        session.refresh(conserje)
        print(f"Conserje creado: {conserje.email}")
        
        # Crear algunos residentes
        residentes_data = [
            {
                "nombre": "Pedro",
                "apellido": "Martínez",
                "email": "pedro@example.com",
                "rut": "12345678-9",
                "vivienda": "101",
                "propietario": True
            },
            {
                "nombre": "Ana",
                "apellido": "Silva",
                "email": "ana@example.com",
                "rut": "98765432-1",
                "vivienda": "102",
                "propietario": True
            },
            {
                "nombre": "Carlos",
                "apellido": "Rojas",
                "email": "carlos@example.com",
                "rut": "11223344-5",
                "vivienda": "103",
                "propietario": False
            }
        ]
        
        for data in residentes_data:
            residente = Residente(
                condominio_id=condominio.id,
                usuario_id=None,
                vivienda_numero=data["vivienda"],
                nombre=data["nombre"],
                apellido=data["apellido"],
                rut=data["rut"],
                telefono="+56912345678",
                email=data["email"],
                es_propietario=data["propietario"],
                fecha_ingreso=date.today(),
                activo=True
            )
            session.add(residente)
            print(f"Residente creado: {residente.nombre} {residente.apellido}")
        
        session.commit()
        
        print("\nSeed completado exitosamente!")
        print("\nCredenciales de prueba:")
        print("- Super Admin: admin@casitasteto.cl / admin123")
        print("- Admin: admin@lospinos.cl / admin123")
        print("- Conserje: conserje@lospinos.cl / conserje123")


if __name__ == "__main__":
    seed_database()