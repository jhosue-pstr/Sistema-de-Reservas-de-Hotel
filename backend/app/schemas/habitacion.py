from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class TipoHabitacionNested(BaseModel):
    id: int
    nombre: str
    precio_dia: float
    capacidad: int

    model_config = ConfigDict(from_attributes=True)


class HabitacionBase(BaseModel):
    piso: str
    numero: str
    tipo_habitacion_id: int
    ocupado: bool = False


class HabitacionCreate(HabitacionBase):
    pass


class HabitacionUpdate(BaseModel):
    piso: Optional[str] = None
    numero: Optional[str] = None
    tipo_habitacion_id: Optional[int] = None
    ocupado: Optional[bool] = None


class HabitacionResponse(HabitacionBase):
    id: int
    tipo_habitacion: Optional[TipoHabitacionNested] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class HabitacionDisponibilidad(BaseModel):
    id: int
    piso: str
    numero: str
    tipo_habitacion: TipoHabitacionNested

    model_config = ConfigDict(from_attributes=True)


class HabitacionDisponibilidadResponse(BaseModel):
    habitacion: HabitacionDisponibilidad
    disponible: bool

    model_config = ConfigDict(from_attributes=True)
