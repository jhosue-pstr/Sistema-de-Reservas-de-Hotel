from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ReservaNested(BaseModel):
    id: int
    fecha_entrada: date
    fecha_salida: date

    model_config = ConfigDict(from_attributes=True)


class FacturaBase(BaseModel):
    reserva_id: int
    total: float
    estado: str = "pendiente"
    metodo_pago: Optional[str] = None


class FacturaCreate(FacturaBase):
    pass


class FacturaUpdate(BaseModel):
    total: Optional[float] = None
    estado: Optional[str] = None
    metodo_pago: Optional[str] = None


class FacturaResponse(FacturaBase):
    id: int
    reserva: Optional[ReservaNested] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
