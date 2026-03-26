from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.app.core.config import get_settings
from src.app.api.clientes import router as clientes_router
from src.app.api.tipoHabitacion import router as tipo_habitacion_router
from src.app.api.habitaciones import router as habitaciones_router
from src.app.api.reservas import router as reservas_router
from src.app.api.facturas import router as facturas_router
from src.app.db.database import engine, Base

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(
    title="Hotel Reservations API",
    description="API for managing hotel reservations",
    version="1.0.0",
    debug=settings.DEBUG,
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(clientes_router)
app.include_router(tipo_habitacion_router)
app.include_router(habitaciones_router)
app.include_router(reservas_router)
app.include_router(facturas_router)


@app.get("/")
async def root():
    return {"message": "Hotel Reservations API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
