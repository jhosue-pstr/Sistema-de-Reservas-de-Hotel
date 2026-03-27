from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict


class ClienteBase(BaseModel):
    nombre: str
    email: EmailStr
    dni:str
    telefono: Optional[str] = None
    direccion: Optional[str] = None


class ClienteCreate(ClienteBase):
    pass


class ClienteUpdate(BaseModel):
    nombre: Optional[str] = None
    dni: Optional[str] = None
    email: Optional[EmailStr] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None


class ClienteResponse(ClienteBase):
    id: int
    dni:str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
