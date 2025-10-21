#!/bin/bash

echo "=== Setup Backend Casitas Teto ==="

# Crear directorio para scripts si no existe
mkdir -p scripts

# Instalar dependencias
echo "Instalando dependencias..."
pip install -r requirements.txt

# Inicializar Alembic si no esta inicializado
if [ ! -d "alembic/versions" ]; then
    echo "Inicializando Alembic..."
    alembic init alembic
fi

# Crear primera migracion
echo "Creando migracion inicial..."
alembic revision --autogenerate -m "Initial migration"

# Aplicar migraciones
echo "Aplicando migraciones..."
alembic upgrade head

echo "=== Setup completado ==="
echo "Para iniciar el servidor ejecuta: uvicorn app.main:app --reload"
