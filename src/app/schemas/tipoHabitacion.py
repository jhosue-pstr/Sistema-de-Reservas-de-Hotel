from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TipoHabitacionBase(BaseModel):
    nombre: str
    precio_dia: float
    capacidad: int


class TipoHabitacionCreate(TipoHabitacionBase):
    pass


class TipoHabitacionUpdate(BaseModel):
    nombre: Optional[str] = None
    precio_dia: Optional[float] = None
    capacidad: Optional[int] = None


class TipoHabitacionResponse(TipoHabitacionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
