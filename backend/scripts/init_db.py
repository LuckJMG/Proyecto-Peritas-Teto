#!/usr/bin/env python3
"""
Script de inicialización de base de datos
Crea las tablas y carga datos de ejemplo, incluyendo un usuario residente completo para pruebas.
"""
import sys
import os

# Agregar el directorio raíz al path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from datetime import date, datetime, timedelta
from decimal import Decimal
from sqlmodel import Session, create_engine, SQLModel, select
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
        # Verificar si ya hay datos
        existing_condominio = session.exec(select(Condominio)).first()
        
        if existing_condominio:
            print("\nLa base de datos ya contiene datos.")
            is_interactive = sys.stdin.isatty()
            
            if force_recreate:
                print("   Modo forzado: eliminando datos existentes...")
                should_recreate = True
            elif not is_interactive:
                print("   Ejecutando en modo no-interactivo. Saltando recreación.")
                return
            else:
                response = input("¿Deseas eliminar y recrear los datos? (s/n): ")
                should_recreate = response.lower() == 's'
            
            if not should_recreate:
                print("Operación cancelada.")
                return
            
            print("\n2. Limpiando datos existentes...")
            # Orden importante por Foreign Keys
            for model in [Pago, Reserva, Multa, GastoComun, Anuncio, EspacioComun, Residente, Usuario, Condominio]:
                session.exec(select(model)).all()
                session.query(model).delete()
            session.commit()
            print("   Datos eliminados")
        
        # --- 3. Condominio ---
        print("\n3. Creando condominio de ejemplo...")
        condominio = Condominio(
            nombre="Condominio Los Pinos",
            direccion="Av. Los Pinos 123, Santiago",
            total_viviendas=50,
            ingresos=Decimal("5750000"),
            activo=True,
            fecha_creacion=datetime.utcnow()
        )
        session.add(condominio)
        session.commit()
        session.refresh(condominio)
        print(f"   ✓ Condominio: {condominio.nombre}")
        
        # --- 4. Usuarios Administrativos ---
        print("\n4. Creando usuarios administrativos...")
        usuarios_data = [
            {
                "email": "superadmin@casitasteto.cl",
                "nombre": "Super", "apellido": "Admin", "password": "admin123",
                "rol": RolUsuario.SUPER_ADMINISTRADOR, "condominio_id": condominio.id
            },
            {
                "email": "admin@lospinos.cl",
                "nombre": "Juan", "apellido": "Pérez", "password": "admin123",
                "rol": RolUsuario.ADMINISTRADOR, "condominio_id": condominio.id
            },
            {
                "email": "conserje@lospinos.cl",
                "nombre": "María", "apellido": "González", "password": "conserje123",
                "rol": RolUsuario.CONSERJE, "condominio_id": condominio.id
            },
            {
                "email": "directiva@lospinos.cl",
                "nombre": "Carlos", "apellido": "Ramírez", "password": "directiva123",
                "rol": RolUsuario.DIRECTIVA, "condominio_id": condominio.id
            }
        ]
        
        admin_user = None
        for user_data in usuarios_data:
            usuario = Usuario(
                email=user_data["email"],
                nombre=user_data["nombre"],
                apellido=user_data["apellido"],
                password_hash=get_password_hash(user_data["password"]),
                rol=user_data["rol"],
                condominio_id=user_data["condominio_id"],
                activo=True
            )
            session.add(usuario)
            if user_data["rol"] == RolUsuario.ADMINISTRADOR:
                admin_user = usuario 
            print(f"   ✓ {usuario.rol.value}: {usuario.email}")
        
        session.commit()
        
        # --- 5. Usuario Residente de Prueba (FULL) ---
        print("\n5. Creando USUARIO RESIDENTE DE PRUEBA (Full Data)...")
        usuario_residente = Usuario(
            email="residente@lospinos.cl",
            nombre="Vicente",
            apellido="Fernández",
            password_hash=get_password_hash("residente123"),
            rol=RolUsuario.RESIDENTE,
            condominio_id=condominio.id,
            activo=True
        )
        session.add(usuario_residente)
        session.commit()
        session.refresh(usuario_residente)
        print(f"   ✓ Usuario Residente: {usuario_residente.email} (Pass: residente123)")

        # --- 6. Perfil de Residente ---
        print("\n6. Creando perfil de residente asociado...")
        residente_prueba = Residente(
            condominio_id=condominio.id,
            usuario_id=usuario_residente.id, # Link clave
            vivienda_numero="305",
            nombre=usuario_residente.nombre,
            apellido=usuario_residente.apellido,
            rut="11.111.111-1",
            telefono="+56999999999",
            email=usuario_residente.email,
            es_propietario=True,
            fecha_ingreso=date.today() - timedelta(days=60),
            activo=True
        )
        session.add(residente_prueba)
        session.commit()
        session.refresh(residente_prueba)
        print(f"   ✓ Perfil Residente creado: Depto {residente_prueba.vivienda_numero}")

        # --- Residentes extra (sin usuario) ---
        otros_residentes = [
            {"nombre": "Pedro", "apellido": "Martínez", "rut": "12345678-9", "vivienda": "101"},
            {"nombre": "Ana", "apellido": "Silva", "rut": "98765432-1", "vivienda": "102"}
        ]
        for r_data in otros_residentes:
            r = Residente(
                condominio_id=condominio.id, usuario_id=None,
                vivienda_numero=r_data["vivienda"], nombre=r_data["nombre"],
                apellido=r_data["apellido"], rut=r_data["rut"],
                email=f"{r_data['nombre'].lower()}@example.com", es_propietario=False, activo=True
            )
            session.add(r)
        session.commit()

        # --- 7. Espacios Comunes ---
        print("\n7. Creando espacios comunes...")
        espacios = []
        espacios_data = [
            {"nombre": "Quincho Principal", "tipo": TipoEspacioComun.QUINCHO, "costo": 25000},
            {"nombre": "Multicancha", "tipo": TipoEspacioComun.MULTICANCHA, "costo": 15000},
            {"nombre": "Sala Eventos", "tipo": TipoEspacioComun.SALA_EVENTOS, "costo": 40000}
        ]
        for esp_data in espacios_data:
            espacio = EspacioComun(
                condominio_id=condominio.id,
                nombre=esp_data["nombre"],
                tipo=esp_data["tipo"],
                capacidad=30,
                costo_por_hora=Decimal(esp_data["costo"]),
                activo=True,
                requiere_pago=True
            )
            session.add(espacio)
            espacios.append(espacio)
        session.commit()
        for e in espacios: session.refresh(e)

        # --- 8. Datos para el Residente de Prueba ---
        hoy = date.today()
        
        # A) Gastos Comunes
        print("\n8. Generando datos financieros para el residente...")
        
        # 1. Gasto PAGADO (Mes anterior)
        gasto_pagado = GastoComun(
            residente_id=residente_prueba.id,
            condominio_id=condominio.id,
            mes=hoy.month - 1 if hoy.month > 1 else 12,
            anio=hoy.year if hoy.month > 1 else hoy.year - 1,
            monto_base=Decimal("50000"),
            cuota_mantencion=Decimal("10000"),
            servicios=Decimal("5000"),
            multas=Decimal("0"),
            monto_total=Decimal("65000"),
            estado=EstadoGastoComun.PAGADO,
            fecha_emision=hoy - timedelta(days=35),
            fecha_vencimiento=hoy - timedelta(days=5),
            fecha_pago=datetime.utcnow() - timedelta(days=10),
            observaciones=[]
        )
        session.add(gasto_pagado)
        session.commit() # Commit para obtener ID del gasto
        session.refresh(gasto_pagado)
        
        # 2. Gasto PENDIENTE (Mes actual)
        gasto_pendiente = GastoComun(
            residente_id=residente_prueba.id,
            condominio_id=condominio.id,
            mes=hoy.month,
            anio=hoy.year,
            monto_base=Decimal("52000"),
            cuota_mantencion=Decimal("10000"),
            servicios=Decimal("0"),
            multas=Decimal("35000"), # Incluye la multa de abajo
            monto_total=Decimal("97000"),
            estado=EstadoGastoComun.PENDIENTE,
            fecha_emision=hoy - timedelta(days=2),
            fecha_vencimiento=hoy + timedelta(days=28),
            observaciones=[]
        )
        session.add(gasto_pendiente)
        session.commit()
        print(f"   ✓ Gastos Comunes creados (1 Pagado, 1 Pendiente)")

        # B) Pagos (CORREGIDO: referencia_id, condominio_id, registrado_por)
        pago_historial = Pago(
            residente_id=residente_prueba.id,
            condominio_id=condominio.id,  
            referencia_id=gasto_pagado.id, 
            monto=Decimal("65000"),
            fecha_pago=datetime.utcnow() - timedelta(days=10),
            metodo_pago=MetodoPago.TRANSFERENCIA,
            estado=EstadoPago.APROBADO,
            tipo=TipoPago.GASTO_COMUN,
            numero_comprobante="TRX-123456",
            registrado_por=admin_user.id if admin_user else 1 # <-- Campo agregado
        )
        session.add(pago_historial)
        print(f"   ✓ Historial de Pagos creado")

        # C) Multas
        multa_residente = Multa(
            residente_id=residente_prueba.id,
            condominio_id=condominio.id,
            tipo=TipoMulta.RUIDO,
            descripcion="Ruidos molestos fuera de horario (Fiesta)",
            monto=Decimal("35000"),
            estado=EstadoMulta.PENDIENTE,
            fecha_emision=hoy - timedelta(days=1),
            creado_por=admin_user.id if admin_user else 1
        )
        session.add(multa_residente)
        print(f"   ✓ Multa asignada: ${multa_residente.monto}")

        # D) Reservas
        # 1. Reserva Futura
        reserva_futura = Reserva(
            espacio_comun_id=espacios[0].id, # Quincho
            residente_id=residente_prueba.id,
            fecha_reserva=hoy + timedelta(days=5),
            hora_inicio="19:00",
            hora_fin="23:00",
            estado=EstadoReserva.CONFIRMADA,
            monto_pago=Decimal("25000") * 4, # 4 horas
            observaciones="Cumpleaños familiar",
            fecha_creacion=datetime.utcnow()
        )
        session.add(reserva_futura)
        
        # 2. Reserva Pasada
        reserva_pasada = Reserva(
            espacio_comun_id=espacios[1].id, # Multicancha
            residente_id=residente_prueba.id,
            fecha_reserva=hoy - timedelta(days=15),
            hora_inicio="10:00",
            hora_fin="12:00",
            estado=EstadoReserva.COMPLETADA,
            monto_pago=Decimal("15000") * 2,
            observaciones="Partido amistoso",
            fecha_creacion=datetime.utcnow() - timedelta(days=20)
        )
        session.add(reserva_pasada)
        session.commit()
        print(f"   ✓ Reservas creadas (1 Futura, 1 Pasada)")

        # --- 9. Anuncios ---
        anuncio = Anuncio(
            condominio_id=condominio.id,
            titulo="Bienvenido Residente de Prueba",
            contenido="Este es un anuncio de prueba visible en tu tablón.",
            activo=True,
            fecha_publicacion=datetime.utcnow(),
            creado_por=admin_user.id if admin_user else 1
        )
        session.add(anuncio)
        session.commit()

    print("\n" + "=" * 60)
    print("✓ SEED COMPLETADO - DATOS DE PRUEBA LISTOS")
    print("=" * 60)
    print("Usuario para pruebas integrales:")
    print("  Email:    residente@lospinos.cl")
    print("  Password: residente123")
    print("  Rol:      RESIDENTE")
    print("-" * 60)


if __name__ == "__main__":
    try:
        init_database()
    except Exception as e:
        print(f"\nERROR: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
