#!/usr/bin/env python3
"""
Script de inicialización de base de datos
Crea las tablas y carga datos de ejemplo
"""
import sys
import os

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlmodel import Session, create_engine, SQLModel
from app.core.config import settings
from app.core.security import get_password_hash
from app.models import (
    Usuario, RolUsuario,
    Condominio,
    Residente,
    GastoComun, EstadoGastoComun,
    Multa, TipoMulta, EstadoMulta,
    EspacioComun, TipoEspacioComun,
    Reserva, EstadoReserva,
    Pago, TipoPago, MetodoPago, EstadoPago,
    Anuncio
)


def init_database(force_recreate=False):
    """
    Inicializa la base de datos con datos de ejemplo
    
    Args:
        force_recreate: Si es True, elimina y recrea los datos sin preguntar
    """
    print("=" * 60)
    print("INICIALIZANDO BASE DE DATOS")
    print("=" * 60)
    
    # Crear engine
    engine = create_engine(settings.DATABASE_URL, echo=False)
    
    print("\n1. Creando tablas...")
    SQLModel.metadata.create_all(engine)
    print("   Tablas creadas")
    
    with Session(engine) as session:
        # Verificar si ya hay datos usando exec() en lugar de query()
        from sqlmodel import select
        existing_condominio = session.exec(select(Condominio)).first()
        
        if existing_condominio:
            print("\nLa base de datos ya contiene datos.")
            
            # Verificar si estamos en un entorno interactivo
            is_interactive = sys.stdin.isatty()
            
            if force_recreate:
                print("   Modo forzado: eliminando datos existentes...")
                should_recreate = True
            elif not is_interactive:
                print("   Ejecutando en modo no-interactivo (Docker)")
                print("   Saltando inicialización para preservar datos existentes.")
                print("   Para forzar recreación, usa: make db-init-force")
                return
            else:
                response = input("¿Deseas eliminar y recrear los datos? (s/n): ")
                should_recreate = response.lower() == 's'
            
            if not should_recreate:
                print("Operación cancelada.")
                return
            
            # Limpiar datos existentes
            print("\n2. Limpiando datos existentes...")
            for model in [Anuncio, Pago, Reserva, EspacioComun, Multa, GastoComun, Residente, Usuario, Condominio]:
                session.exec(select(model)).all()  # Para cargar en memoria
                session.query(model).delete()
            session.commit()
            print("   Datos eliminados")
        
        print("\n3. Creando condominio de ejemplo...")
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
        print(f"   ✓ Condominio: {condominio.nombre} (ID: {condominio.id})")
        
        print("\n4. Creando usuarios...")
        usuarios_data = [
            {
                "email": "superadmin@casitasteto.cl",
                "nombre": "Super",
                "apellido": "Admin",
                "password": "admin123",
                "rol": RolUsuario.SUPER_ADMINISTRADOR,
                "condominio_id": None
            },
            {
                "email": "admin@lospinos.cl",
                "nombre": "Juan",
                "apellido": "Pérez",
                "password": "admin123",
                "rol": RolUsuario.ADMINISTRADOR,
                "condominio_id": condominio.id
            },
            {
                "email": "conserje@lospinos.cl",
                "nombre": "María",
                "apellido": "González",
                "password": "conserje123",
                "rol": RolUsuario.CONSERJE,
                "condominio_id": condominio.id
            },
            {
                "email": "directiva@lospinos.cl",
                "nombre": "Carlos",
                "apellido": "Ramírez",
                "password": "directiva123",
                "rol": RolUsuario.DIRECTIVA,
                "condominio_id": condominio.id
            }
        ]
        
        usuarios = []
        for user_data in usuarios_data:
            usuario = Usuario(
                email=user_data["email"],
                nombre=user_data["nombre"],
                apellido=user_data["apellido"],
                password_hash=get_password_hash(user_data["password"]),
                rol=user_data["rol"],
                condominio_id=user_data["condominio_id"],
                activo=True,
                fecha_creacion=datetime.utcnow()
            )
            session.add(usuario)
            usuarios.append(usuario)
            print(f"   ✓ {usuario.rol.value}: {usuario.email}")
        
        session.commit()
        for u in usuarios:
            session.refresh(u)
        
        print("\n5. Creando residentes...")
        residentes_data = [
            {
                "nombre": "Pedro",
                "apellido": "Martínez",
                "email": "pedro.martinez@example.com",
                "rut": "12345678-9",
                "vivienda": "101",
                "telefono": "+56912345678",
                "propietario": True
            },
            {
                "nombre": "Ana",
                "apellido": "Silva",
                "email": "ana.silva@example.com",
                "rut": "98765432-1",
                "vivienda": "102",
                "telefono": "+56923456789",
                "propietario": True
            },
            {
                "nombre": "Carlos",
                "apellido": "Rojas",
                "email": "carlos.rojas@example.com",
                "rut": "11223344-5",
                "vivienda": "103",
                "telefono": "+56934567890",
                "propietario": False
            },
            {
                "nombre": "Laura",
                "apellido": "Fernández",
                "email": "laura.fernandez@example.com",
                "rut": "55667788-9",
                "vivienda": "201",
                "telefono": "+56945678901",
                "propietario": True
            },
            {
                "nombre": "Diego",
                "apellido": "Morales",
                "email": "diego.morales@example.com",
                "rut": "99887766-5",
                "vivienda": "202",
                "telefono": "+56956789012",
                "propietario": False
            }
        ]
        
        residentes = []
        for res_data in residentes_data:
            residente = Residente(
                condominio_id=condominio.id,
                usuario_id=None,
                vivienda_numero=res_data["vivienda"],
                nombre=res_data["nombre"],
                apellido=res_data["apellido"],
                rut=res_data["rut"],
                telefono=res_data["telefono"],
                email=res_data["email"],
                es_propietario=res_data["propietario"],
                fecha_ingreso=date.today() - timedelta(days=365),
                activo=True
            )
            session.add(residente)
            residentes.append(residente)
            print(f"   Residente: {residente.nombre} {residente.apellido} - Depto {residente.vivienda_numero}")
        
        session.commit()
        for r in residentes:
            session.refresh(r)
        
        print("\n6. Creando espacios comunes...")
        espacios_data = [
            {
                "nombre": "Quincho Principal",
                "tipo": TipoEspacioComun.QUINCHO,
                "capacidad": 30,
                "costo": Decimal("25000"),
                "descripcion": "Quincho equipado con parrilla y mesas",
                "requiere_pago": True
            },
            {
                "nombre": "Multicancha",
                "tipo": TipoEspacioComun.MULTICANCHA,
                "capacidad": 20,
                "costo": Decimal("15000"),
                "descripcion": "Cancha de fútbol y básquetbol",
                "requiere_pago": True
            },
            {
                "nombre": "Sala de Eventos",
                "tipo": TipoEspacioComun.SALA_EVENTOS,
                "capacidad": 50,
                "costo": Decimal("40000"),
                "descripcion": "Sala con cocina y baños",
                "requiere_pago": True
            },
            {
                "nombre": "Estacionamiento Visitas 1",
                "tipo": TipoEspacioComun.ESTACIONAMIENTO,
                "capacidad": 1,
                "costo": None,
                "descripcion": "Estacionamiento para visitas",
                "requiere_pago": False
            },
            {
                "nombre": "Estacionamiento Visitas 2",
                "tipo": TipoEspacioComun.ESTACIONAMIENTO,
                "capacidad": 1,
                "costo": None,
                "descripcion": "Estacionamiento para visitas",
                "requiere_pago": False
            }
        ]
        
        espacios = []
        for esp_data in espacios_data:
            espacio = EspacioComun(
                condominio_id=condominio.id,
                nombre=esp_data["nombre"],
                tipo=esp_data["tipo"],
                capacidad=esp_data["capacidad"],
                costo_por_hora=esp_data["costo"],
                descripcion=esp_data["descripcion"],
                activo=True,
                requiere_pago=esp_data["requiere_pago"]
            )
            session.add(espacio)
            espacios.append(espacio)
            print(f"   ✓ {espacio.tipo.value}: {espacio.nombre}")
        
        session.commit()
        for e in espacios:
            session.refresh(e)
        
        print("\n7. Creando gastos comunes...")
        hoy = date.today()
        for i, residente in enumerate(residentes[:3]):
            gasto = GastoComun(
                residente_id=residente.id,
                condominio_id=condominio.id,
                mes=hoy.month,
                anio=hoy.year,
                monto_base=Decimal("80000"),
                cuota_mantencion=Decimal("20000"),
                servicios=Decimal("15000"),
                multas=Decimal("0"),
                monto_total=Decimal("115000"),
                estado=EstadoGastoComun.PENDIENTE if i < 2 else EstadoGastoComun.PAGADO,
                fecha_emision=hoy - timedelta(days=10),
                fecha_vencimiento=hoy + timedelta(days=20),
                fecha_pago=datetime.utcnow() if i == 2 else None,
                observaciones=[]
            )
            session.add(gasto)
            print(f"   ✓ Gasto común para {residente.nombre} {residente.apellido}: ${gasto.monto_total}")
        
        session.commit()
        
        print("\n8. Creando multas...")
        multas_data = [
            {
                "residente": residentes[0],
                "tipo": TipoMulta.RUIDO,
                "descripcion": "Ruidos molestos después de las 23:00 hrs",
                "monto": Decimal("15000"),
                "estado": EstadoMulta.PENDIENTE
            },
            {
                "residente": residentes[1],
                "tipo": TipoMulta.MASCOTA,
                "descripcion": "Mascota sin correa en áreas comunes",
                "monto": Decimal("10000"),
                "estado": EstadoMulta.PAGADA
            }
        ]
        
        for multa_data in multas_data:
            multa = Multa(
                residente_id=multa_data["residente"].id,
                condominio_id=condominio.id,
                tipo=multa_data["tipo"],
                descripcion=multa_data["descripcion"],
                monto=multa_data["monto"],
                estado=multa_data["estado"],
                fecha_emision=hoy - timedelta(days=5),
                fecha_pago=datetime.utcnow() if multa_data["estado"] == EstadoMulta.PAGADA else None,
                creado_por=usuarios[1].id
            )
            session.add(multa)
            print(f"   ✓ Multa {multa.tipo.value} para {multa_data['residente'].nombre}: ${multa.monto}")
        
        session.commit()
        
        print("\n9. Creando reservas...")
        reservas_data = [
            {
                "espacio": espacios[0],  # Quincho
                "residente": residentes[0],
                "fecha": hoy + timedelta(days=7),
                "hora_inicio": "18:00",
                "hora_fin": "23:00",
                "estado": EstadoReserva.CONFIRMADA
            },
            {
                "espacio": espacios[1],  # Multicancha
                "residente": residentes[1],
                "fecha": hoy + timedelta(days=3),
                "hora_inicio": "15:00",
                "hora_fin": "17:00",
                "estado": EstadoReserva.PENDIENTE_PAGO
            }
        ]
        
        for res_data in reservas_data:
            reserva = Reserva(
                espacio_comun_id=res_data["espacio"].id,
                residente_id=res_data["residente"].id,
                fecha_reserva=res_data["fecha"],
                hora_inicio=res_data["hora_inicio"],
                hora_fin=res_data["hora_fin"],
                estado=res_data["estado"],
                monto_pago=res_data["espacio"].costo_por_hora * 5 if res_data["espacio"].requiere_pago else None,
                observaciones="",
                fecha_creacion=datetime.utcnow()
            )
            session.add(reserva)
            print(f"   ✓ Reserva {res_data['espacio'].nombre} para {res_data['residente'].nombre}")
        
        session.commit()
        
        print("\n10. Creando anuncios...")
        anuncios_data = [
            {
                "titulo": "Mantención de jardines",
                "contenido": "Se informa que el día viernes 15 se realizará mantención de jardines. Por favor mantener mascotas dentro de los departamentos.",
            },
            {
                "titulo": "Corte de agua programado",
                "contenido": "El día sábado 20 desde las 09:00 hasta las 14:00 hrs habrá corte de agua por trabajos de mantención.",
            },
            {
                "titulo": "Junta de copropietarios",
                "contenido": "Se convoca a junta de copropietarios para el día 25 a las 19:00 hrs en la sala de eventos.",
            }
        ]
        
        for anun_data in anuncios_data:
            anuncio = Anuncio(
                condominio_id=condominio.id,
                titulo=anun_data["titulo"],
                contenido=anun_data["contenido"],
                activo=True,
                fecha_publicacion=datetime.utcnow(),
                creado_por=usuarios[1].id
            )
            session.add(anuncio)
            print(f"   ✓ Anuncio: {anuncio.titulo}")
        
        session.commit()
    
    print("\n" + "=" * 60)
    print("✓ BASE DE DATOS INICIALIZADA CORRECTAMENTE")
    print("=" * 60)
    print("\nCREDENCIALES DE ACCESO:")
    print("-" * 60)
    print("Super Admin:")
    print("  Email: superadmin@casitasteto.cl")
    print("  Password: admin123")
    print("\nAdministrador:")
    print("  Email: admin@lospinos.cl")
    print("  Password: admin123")
    print("\nConserje:")
    print("  Email: conserje@lospinos.cl")
    print("  Password: conserje123")
    print("\nDirectiva:")
    print("  Email: directiva@lospinos.cl")
    print("  Password: directiva123")
    print("-" * 60)
    print("\nLa API está disponible en: http://localhost:8000")
    print("Documentación: http://localhost:8000/docs")
    print()


if __name__ == "__main__":
    try:
        init_database()
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)