from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_SERVER: str
    POSTGRES_PORT: int
    POSTGRES_DB: str
    
    DATABASE_URL: str
    SECRET_KEY: str
    DEBUG: bool = False
    ENVIRONMENT: str = "local"

    class Config:
        env_file = ".env"
        extra = "allow"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
