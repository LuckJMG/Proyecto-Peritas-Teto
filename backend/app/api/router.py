from fastapi import APIRouter
from app.api.v1 import auth

api_router = APIRouter()

# Incluir todos los routers
api_router.include_router(auth.router)

# TODO: Agregar más routers a medida que se implementen
# api_router.include_router(usuarios.router)
# api_router.include_router(condominios.router)
# api_router.include_router(residentes.router)
# api_router.include_router(gastos_comunes.router)
# api_router.include_router(multas.router)
# api_router.include_router(espacios_comunes.router)
# api_router.include_router(reservas.router)
# api_router.include_router(pagos.router)
# api_router.include_router(anuncios.router)
