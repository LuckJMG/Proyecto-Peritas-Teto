#!/bin/bash

echo "=== Inicializando Proyecto Casitas Teto ==="

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "requirements.txt" ]; then
    echo "Error: Ejecuta este script desde el directorio backend/"
    exit 1
fi

echo -e "${YELLOW}1. Instalando dependencias...${NC}"
pip install -r requirements.txt

echo -e "${YELLOW}2. Creando directorios necesarios...${NC}"
mkdir -p app/api/v1
mkdir -p app/schemas
mkdir -p app/services
mkdir -p app/utils
mkdir -p scripts
mkdir -p alembic/versions

echo -e "${YELLOW}3. Creando archivos __init__.py...${NC}"
touch app/__init__.py
touch app/api/__init__.py
touch app/api/v1/__init__.py
touch app/schemas/__init__.py
touch app/services/__init__.py
touch app/utils/__init__.py
touch app/core/__init__.py

echo -e "${YELLOW}4. Inicializando Alembic...${NC}"
if [ ! -f "alembic.ini" ]; then
    alembic init alembic
    echo -e "${GREEN}Alembic inicializado${NC}"
else
    echo -e "${GREEN}Alembic ya está inicializado${NC}"
fi

echo -e "${YELLOW}5. Creando migración inicial...${NC}"
alembic revision --autogenerate -m "Initial migration"

echo -e "${YELLOW}6. Aplicando migraciones...${NC}"
alembic upgrade head

echo -e "${GREEN}=== Proyecto inicializado correctamente ===${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Ejecuta 'python scripts/seed_data.py' para cargar datos de prueba"
echo "2. Ejecuta 'uvicorn app.main:app --reload' para iniciar el servidor"
echo "3. Visita http://localhost:8000/docs para ver la documentación"
