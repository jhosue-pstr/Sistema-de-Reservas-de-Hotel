from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Hotel Reservations API",
    description="API for managing hotel reservations",
    version="1.0.0",
    debug=settings.DEBUG
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hotel Reservations API", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
