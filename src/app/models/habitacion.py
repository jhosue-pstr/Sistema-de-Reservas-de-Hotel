from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from src.app.db.database import Base


class Habitacion(Base):
    __tablename__="habitaciones"
    
    id = Column(Integer, primary_key=True, index=True)
    piso = Column(String(100), nullable=False)
    numero = Column(String(100), nullable=False)
    tipo_habitacion_id = Column(Integer, ForeignKey("tipoHabitacion.id"), nullable=False)
    ocupado = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    tipo_habitacion = relationship("TipoHabitacion", back_populates="habitaciones")
    reservas = relationship("Reserva", back_populates="habitacion")