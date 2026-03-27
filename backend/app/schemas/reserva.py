from datetime import date, time, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class HabitacionNested(BaseModel):
    id: int
    piso: str
    numero: str
    tipo_habitacion_id: int
    ocupado: bool

    model_config = ConfigDict(from_attributes=True)


class TipoHabitacionNested(BaseModel):
    id: int
    nombre: str
    precio_dia: float
    capacidad: int

    model_config = ConfigDict(from_attributes=True)


class HabitacionDisponibilidad(BaseModel):
    id: int
    piso: str
    numero: str
    tipo_habitacion: TipoHabitacionNested

    model_config = ConfigDict(from_attributes=True)


class ClienteNested(BaseModel):
    id: int
    nombre: str
    email: str

    model_config = ConfigDict(from_attributes=True)


class ReservaBase(BaseModel):
    cliente_id: int
    habitacion_id: int
    fecha_entrada: date
    hora_entrada: time
    fecha_salida: date
    hora_salida: time


class ReservaCreate(ReservaBase):
    pass


class ReservaUpdate(BaseModel):
    cliente_id: Optional[int] = None
    habitacion_id: Optional[int] = None
    fecha_entrada: Optional[date] = None
    hora_entrada: Optional[time] = None
    fecha_salida: Optional[date] = None
    hora_salida: Optional[time] = None


class ReservaResponse(BaseModel):
    id: int
    cliente_id: int
    habitacion_id: int
    fecha_entrada: date
    hora_entrada: time
    fecha_salida: date
    hora_salida: time
    estado: Optional[str] = None
    habitacion: Optional[HabitacionNested] = None
    cliente: Optional[ClienteNested] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ReservaDisponibilidad(BaseModel):
    habitacion: HabitacionDisponibilidad
    disponible: bool

    model_config = ConfigDict(from_attributes=True)
