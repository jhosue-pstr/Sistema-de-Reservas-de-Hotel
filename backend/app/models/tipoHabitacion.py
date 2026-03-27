from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.db.database import Base


class TipoHabitacion(Base):
    __tablename__ = "tipoHabitacion"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    precio_dia = Column(Float, nullable=False)
    capacidad = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    habitaciones = relationship("Habitacion", back_populates="tipo_habitacion")