FROM python:3.11-slim AS builder

WORKDIR /usr/src/app

# Instalar dependencias del sistema necesarias para psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar solo requirements primero (cache de Docker)
COPY requirements.txt .

# Instalar dependencias
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copiar el resto del código
COPY . .

# Stage final - imagen limpia
FROM python:3.11-slim AS service

WORKDIR /app

# Instalar solo las dependencias de runtime necesarias
RUN apt-get update && apt-get install -y \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar las dependencias de Python instaladas
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Copiar código de la aplicación
COPY --from=builder /usr/src/app /app

# Variables de entorno
ENV PYTHONPATH=/app \
    PYTHONUNBUFFERED=1

# Verificar instalación
RUN python --version && \
    pip --version && \
    alembic --version

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]