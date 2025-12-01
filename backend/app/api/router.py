from fastapi import APIRouter
from app.api.v1 import auth, condominio, espacio_comun, residente, multa, reserva, usuario, gasto_comun, anuncios, pago, transbank, registros, alerta

api_router = APIRouter()

# Incluir todos los routers
api_router.include_router(auth.router)
api_router.include_router(condominio.router)
api_router.include_router(espacio_comun.router)
api_router.include_router(residente.router)
api_router.include_router(multa.router)
api_router.include_router(reserva.router)
api_router.include_router(usuario.router)
api_router.include_router(gasto_comun.router)
api_router.include_router(anuncios.router)
api_router.include_router(pago.router)
api_router.include_router(transbank.router)
api_router.include_router(registros.router)
api_router.include_router(alerta.router)